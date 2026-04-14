import {
  createOpenAIChatCompletionStream,
  type OpenAIChatMessage,
} from "@/config/openai";

export type ChatHistoryEntry = {
  role: "user" | "assistant";
  content: string;
};

type StreamChatResponseParams = {
  message: string;
  history?: ChatHistoryEntry[];
  signal?: AbortSignal;
};

const SYSTEM_PROMPT = `You are MedAI, a supportive health assistant.
Reply conversationally and clearly.
Do not claim to replace a licensed clinician.
If symptoms sound urgent or dangerous, advise the user to seek immediate medical care.`;

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

function normalizeHistory(history: ChatHistoryEntry[] = []) {
  return history
    .filter(
      (entry) =>
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.trim().length > 0
    )
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim(),
    }));
}

function buildMessages(
  history: ChatHistoryEntry[],
  message: string
): OpenAIChatMessage[] {
  return [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...history.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
    {
      role: "user",
      content: message,
    },
  ];
}

function parseAssistantDelta(eventBlock: string) {
  const data = eventBlock
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (!data || data === "[DONE]") {
    return "";
  }

  const payload = JSON.parse(data) as {
    choices?: Array<{
      delta?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };
  const content = payload.choices?.[0]?.delta?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (part?.type === "text" ? part.text ?? "" : ""))
      .join("");
  }

  return "";
}

export async function streamChatResponse({
  message,
  history,
  signal,
}: StreamChatResponseParams) {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw Object.assign(new Error("Message is required."), { status: 400 });
  }

  const upstream = await createOpenAIChatCompletionStream(
    buildMessages(normalizeHistory(history), trimmedMessage),
    signal
  );

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += textDecoder.decode(value, { stream: true });
          const parts = buffer.split(/\r?\n\r?\n/);
          buffer = parts.pop() ?? "";

          for (const eventBlock of parts) {
            const text = parseAssistantDelta(eventBlock);
            if (!text) {
              continue;
            }

            controller.enqueue(textEncoder.encode(text));
          }
        }

        buffer += textDecoder.decode();
        const remainingParts = buffer
          ? buffer.split(/\r?\n\r?\n/).filter(Boolean)
          : [];

        for (const eventBlock of remainingParts) {
          const text = parseAssistantDelta(eventBlock);
          if (!text) {
            continue;
          }

          controller.enqueue(textEncoder.encode(text));
        }

        controller.close();
      } catch (error) {
        if (signal?.aborted) {
          controller.close();
          return;
        }

        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}
