import { NextRequest, NextResponse } from "next/server";
import { streamChatResponse, type ChatHistoryEntry } from "../../../lib/ai/controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: { message?: string; history?: ChatHistoryEntry[] };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = payload.message?.trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const stream = await streamChatResponse({
      message,
      history: payload.history,
      signal: request.signal,
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;
    const messageText =
      error instanceof Error
        ? error.message
        : "Could not generate a response from the configured AI provider.";

    return NextResponse.json({ error: messageText }, { status });
  }
}
