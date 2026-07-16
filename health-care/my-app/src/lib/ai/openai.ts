export type OpenAIChatRole = "system" | "user" | "assistant";

export type OpenAIChatMessage = {
  role: OpenAIChatRole;
  content: string;
};

type OpenAIRequestError = Error & {
  status?: number;
};

function createConfigurationError(message: string): OpenAIRequestError {
  return Object.assign(new Error(message), { status: 500 });
}

function createRequestError(message: string, status: number): OpenAIRequestError {
  return Object.assign(new Error(message), { status });
}

function parseOpenAIError(errorText: string) {
  try {
    const payload = JSON.parse(errorText) as {
      error?: {
        message?: string;
        code?: string;
      };
    };

    const code = payload.error?.code;
    const message = payload.error?.message;

    if (code === "insufficient_quota") {
      return "The configured OpenAI account has no available quota. Check billing, credits, or project limits in the OpenAI dashboard.";
    }

    if (code === "invalid_api_key") {
      return "The configured OpenAI API key is invalid. Create a new key and update OPENAI_API_KEY in .env.local.";
    }

    return message || errorText;
  } catch {
    return errorText;
  }
}

function getBaseUrl() {
  const baseUrl = process.env.OPENAI_BASE_URL?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw createConfigurationError("OPENAI_BASE_URL is not configured.");
  }

  return baseUrl;
}

function getApiKey() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw createConfigurationError("OPENAI_API_KEY is not configured.");
  }

  return apiKey;
}

export function getOpenAIModel() {
  const model = process.env.OPENAI_MODEL?.trim();

  if (!model) {
    throw createConfigurationError("OPENAI_MODEL is not configured.");
  }

  return model;
}

export async function createOpenAIChatCompletionStream(
  messages: OpenAIChatMessage[],
  signal?: AbortSignal,
) {
  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: getOpenAIModel(),
      messages,
      stream: true,
    }),
    cache: "no-store",
    signal,
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw createRequestError(
      errorText ? parseOpenAIError(errorText) : "OpenAI returned an invalid response.",
      response.status || 502,
    );
  }

  return response.body;
}
