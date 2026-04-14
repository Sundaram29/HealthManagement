"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Moon, PanelLeft, Plus, Sun } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  state: "streaming" | "done" | "error";
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

type PersistedChatState = {
  chats: Chat[];
  activeChatId: string;
};

const CHAT_STORAGE_KEY = "health-user-medai-chat-v1";

const initialChat: Chat = {
  id: "chat-1",
  title: "New chat",
  messages: [],
};

const starterPrompts = [
  "I have a sore throat and headache. What should I watch for?",
  "Help me summarize my symptoms for a doctor appointment.",
  "What questions should I ask before starting a new medicine?",
];

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createChat(): Chat {
  return {
    id: createId("chat"),
    title: "New chat",
    messages: [],
  };
}

function buildTitle(text: string) {
  const compact = text.trim().replace(/\s+/g, " ");
  return compact ? compact.slice(0, 32) : "New chat";
}

function buildChatBadge(title: string) {
  const initials = title
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "N";
}

function sanitizeChats(value: unknown): Chat[] {
  if (!Array.isArray(value)) {
    return [initialChat];
  }

  const chats = value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Partial<Chat>;
    const id =
      typeof candidate.id === "string" && candidate.id.trim()
        ? candidate.id
        : createId("chat");
    const title =
      typeof candidate.title === "string" && candidate.title.trim()
        ? candidate.title
        : "New chat";
    const messages = Array.isArray(candidate.messages)
      ? candidate.messages.flatMap((message) => {
          if (!message || typeof message !== "object") {
            return [];
          }

          const candidateMessage = message as Partial<Message>;
          const role =
            candidateMessage.role === "user" || candidateMessage.role === "assistant"
              ? candidateMessage.role
              : null;
          const content =
            typeof candidateMessage.content === "string"
              ? candidateMessage.content
              : "";

          if (!role || !content.trim()) {
            return [];
          }

          const normalizedMessage: Message = {
            id:
              typeof candidateMessage.id === "string" && candidateMessage.id.trim()
                ? candidateMessage.id
                : createId(role),
            role,
            content,
            state: candidateMessage.state === "error" ? "error" : "done",
          };

          return [normalizedMessage];
        })
      : [];

    return [{ id, title, messages }];
  });

  return chats.length > 0 ? chats : [initialChat];
}

function sanitizePersistedChatState(value: unknown): PersistedChatState {
  if (!value || typeof value !== "object") {
    return {
      chats: [initialChat],
      activeChatId: initialChat.id,
    };
  }

  const candidate = value as Partial<PersistedChatState>;
  const chats = sanitizeChats(candidate.chats);
  const activeChatId =
    typeof candidate.activeChatId === "string" &&
    chats.some((chat) => chat.id === candidate.activeChatId)
      ? candidate.activeChatId
      : chats[0].id;

  return {
    chats,
    activeChatId,
  };
}

export default function AIChatbotPage() {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [chats, setChats] = useState<Chat[]>([initialChat]);
  const [activeChatId, setActiveChatId] = useState(initialChat.id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hasLoadedPersistedChatsRef = useRef(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];
  const sidebarVisible = !isMobileViewport || mobileSidebarOpen;
  const sidebarExpanded = isMobileViewport || !sidebarCollapsed;

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = await response.json().catch(() => ({ session: null }));

        if (!payload?.session || payload.session.role !== "user") {
          router.replace("/auth/login?redirectTo=/ai-chatbot");
          return;
        }
      } finally {
        setCheckingAccess(false);
      }
    };

    void verifySession();
  }, [router]);

  useEffect(() => {
    try {
      const storedState = window.localStorage.getItem(CHAT_STORAGE_KEY);

      if (storedState) {
        const parsedState = JSON.parse(storedState) as unknown;
        const sanitizedState = sanitizePersistedChatState(parsedState);
        setChats(sanitizedState.chats);
        setActiveChatId(sanitizedState.activeChatId);
      }
    } catch {
      setChats([initialChat]);
      setActiveChatId(initialChat.id);
    } finally {
      hasLoadedPersistedChatsRef.current = true;
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileViewport(mobile);

      if (!mobile) {
        setMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeChat?.messages, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [input]);

  useEffect(() => {
    if (!hasLoadedPersistedChatsRef.current) {
      return;
    }

    const persistedState: PersistedChatState = {
      chats,
      activeChatId,
    };

    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(persistedState));
    } catch {}
  }, [activeChatId, chats]);

  const updateChat = (chatId: string, updater: (chat: Chat) => Chat) => {
    setChats((previous) =>
      previous.map((chat) => (chat.id === chatId ? updater(chat) : chat)),
    );
  };

  const toggleSidebar = () => {
    if (isMobileViewport) {
      setMobileSidebarOpen((previous) => !previous);
      return;
    }

    setSidebarCollapsed((previous) => !previous);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);

    if (isMobileViewport) {
      setMobileSidebarOpen(false);
    }
  };

  const handleSend = async (prefilledInput?: string) => {
    const messageText = (prefilledInput ?? input).trim();

    if (!messageText || !activeChat || loading) {
      return;
    }

    const chatId = activeChat.id;
    const history = activeChat.messages
      .filter((message) => message.state === "done" && message.content.trim().length > 0)
      .map(({ role, content }) => ({ role, content }));
    const userMessage: Message = {
      id: createId("user"),
      role: "user",
      content: messageText,
      state: "done",
    };
    const assistantMessageId = createId("assistant");
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      state: "streaming",
    };

    updateChat(chatId, (chat) => ({
      ...chat,
      title: chat.messages.length === 0 ? buildTitle(messageText) : chat.title,
      messages: [...chat.messages, userMessage, assistantMessage],
    }));

    setInput("");
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          history,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error ?? "Chat request failed.");
      }

      if (!response.body) {
        throw new Error("The chatbot response stream was empty.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assembledResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        assembledResponse += decoder.decode(value, { stream: true });

        updateChat(chatId, (chat) => ({
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: assembledResponse,
                  state: "streaming",
                }
              : message,
          ),
        }));
      }

      assembledResponse += decoder.decode();

      updateChat(chatId, (chat) => ({
        ...chat,
        messages: chat.messages.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: assembledResponse.trim() || "I could not generate a response.",
                state: "done",
              }
            : message,
        ),
      }));
    } catch (caughtError) {
      const aborted =
        caughtError instanceof DOMException && caughtError.name === "AbortError";
      const errorMessage =
        aborted
          ? "Response stopped."
          : caughtError instanceof Error
            ? caughtError.message
            : "Something went wrong while contacting the chatbot.";

      if (!aborted) {
        setError(errorMessage);
      }

      updateChat(chatId, (chat) => ({
        ...chat,
        messages: chat.messages.map((messageItem) =>
          messageItem.id === assistantMessageId
            ? {
                ...messageItem,
                content: messageItem.content || errorMessage,
                state: aborted ? "done" : "error",
              }
            : messageItem,
        ),
      }));
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  const handleNewChat = () => {
    const chat = createChat();
    setChats((previous) => [chat, ...previous]);
    setActiveChatId(chat.id);
    setInput("");
    setError(null);

    if (isMobileViewport) {
      setMobileSidebarOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="rounded-[32px] border border-white/10 bg-white/5 px-8 py-10 text-center backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">MedAI</p>
          <h1 className="mt-3 text-2xl font-semibold">Checking your user session...</h1>
        </div>
      </main>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? "bg-[#111317] text-zinc-100" : "bg-[#f3f5f8] text-zinc-900"}`}>
      {isMobileViewport && mobileSidebarOpen ? (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-20 cursor-pointer bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-screen w-[86vw] max-w-72 flex-col overflow-hidden border-r transition-[transform,width] duration-300 ease-out md:sticky md:top-0 md:max-w-none md:translate-x-0 md:shrink-0 ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        } ${sidebarExpanded ? "md:w-72" : "md:w-20"} ${
          darkMode ? "border-white/10 bg-[#0b0d10]" : "border-black/10 bg-white/90"
        }`}
      >
        <div className={`flex items-center py-4 ${sidebarExpanded ? "justify-between px-4" : "justify-center px-3"}`}>
          <div className={`flex min-w-0 items-center ${sidebarExpanded ? "gap-3" : ""}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <MessageSquare size={18} />
            </div>
            {sidebarExpanded ? (
              <div className="min-w-0">
                <p className="text-sm font-semibold">MedAI</p>
                <p className={`text-xs ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>
                  User health assistant
                </p>
              </div>
            ) : null}
          </div>

          {isMobileViewport ? (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className={`cursor-pointer rounded-xl p-2 transition md:hidden ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"}`}
            >
              <PanelLeft size={18} />
            </button>
          ) : null}
        </div>

        <div className={`${sidebarExpanded ? "px-4" : "px-3"} pb-3`}>
          <button
            onClick={handleNewChat}
            aria-label="New chat"
            title="New chat"
            className={`flex cursor-pointer items-center justify-center rounded-2xl bg-emerald-600 text-sm font-medium text-white transition hover:bg-emerald-500 ${
              sidebarExpanded ? "w-full gap-2 px-4 py-3" : "mx-auto h-12 w-12"
            }`}
          >
            <Plus size={16} />
            {sidebarExpanded ? "New chat" : null}
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto pb-4 ${sidebarExpanded ? "space-y-2 px-3" : "space-y-3 px-3"}`}>
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              aria-label={chat.title}
              title={sidebarExpanded ? undefined : chat.title}
              className={`flex cursor-pointer items-center rounded-2xl text-sm transition ${
                sidebarExpanded
                  ? `w-full gap-3 px-3 py-3 text-left ${
                      chat.id === activeChatId
                        ? darkMode
                          ? "bg-white/8 text-white"
                          : "bg-zinc-900 text-white"
                        : darkMode
                          ? "text-zinc-300 hover:bg-white/5"
                          : "text-zinc-700 hover:bg-black/5"
                    }`
                  : `mx-auto h-12 w-12 justify-center ${
                      chat.id === activeChatId
                        ? darkMode
                          ? "bg-white/10 text-white ring-1 ring-emerald-400/30"
                          : "bg-zinc-900 text-white"
                        : darkMode
                          ? "text-zinc-300 hover:bg-white/5"
                          : "text-zinc-700 hover:bg-black/5"
                    }`
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold ${
                  chat.id === activeChatId
                    ? darkMode
                      ? "bg-emerald-400 text-zinc-950"
                      : "bg-white/15 text-white"
                    : darkMode
                      ? "bg-white/8 text-zinc-200"
                      : "bg-black/5 text-zinc-700"
                }`}
              >
                {buildChatBadge(chat.title)}
              </div>
              {sidebarExpanded ? <span className="truncate">{chat.title}</span> : null}
            </button>
          ))}
        </div>
      </aside>

      <div
        className={`flex h-screen min-w-0 flex-1 flex-col ${
          darkMode
            ? "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),#111317]"
            : "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_32%),#f3f5f8]"
        }`}
      >
        <div
          className={`sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur ${
            darkMode ? "border-white/10 bg-[#111317]/85" : "border-black/10 bg-white/85"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={toggleSidebar}
              aria-label={
                isMobileViewport
                  ? mobileSidebarOpen
                    ? "Close sidebar"
                    : "Open sidebar"
                  : sidebarCollapsed
                    ? "Expand sidebar"
                    : "Collapse sidebar"
              }
              className={`cursor-pointer rounded-xl p-2 transition ${
                darkMode ? "hover:bg-white/5" : "hover:bg-black/5"
              }`}
            >
              <PanelLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">AI Symptom Checker</p>
              <p className={`truncate text-xs ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>
                Streaming responses from the merged hospital AI backend
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                darkMode ? "bg-white/8 text-zinc-100 hover:bg-white/12" : "bg-black/5 text-zinc-800 hover:bg-black/10"
              }`}
            >
              Back to home
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`cursor-pointer rounded-xl p-2 transition ${
                darkMode ? "text-amber-300 hover:bg-white/5" : "text-zinc-700 hover:bg-black/5"
              }`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-32 pt-6 sm:px-4 sm:pb-36 sm:pt-8">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            {error ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  darkMode ? "border-rose-400/20 bg-rose-500/10 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {error}
              </div>
            ) : null}

            {activeChat.messages.length === 0 ? (
              <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-500/15 text-emerald-400">
                  <MessageSquare size={30} />
                </div>
                <h1 className="text-3xl font-semibold sm:text-4xl">Ask MedAI anything</h1>
                <p className={`mt-3 max-w-xl text-sm sm:text-base ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  This assistant was merged from the hospital project into the user website so you can discuss symptoms, visit prep, and care questions in one place.
                </p>
                <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void handleSend(prompt)}
                      disabled={loading}
                      className={`cursor-pointer rounded-3xl border px-4 py-4 text-left text-sm transition disabled:cursor-default disabled:opacity-70 ${
                        darkMode
                          ? "border-white/10 bg-white/5 hover:border-emerald-400/40 hover:bg-white/8"
                          : "border-black/10 bg-white hover:border-emerald-500/40 hover:shadow-sm"
                      }`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeChat.messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" ? (
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-xs font-semibold text-emerald-400">
                      AI
                    </div>
                  ) : null}

                  <div
                    className={`max-w-[88%] rounded-[26px] px-4 py-4 text-[15px] leading-8 shadow-sm sm:max-w-3xl sm:px-5 sm:text-base ${
                      message.role === "user"
                        ? "bg-emerald-600 text-white"
                        : darkMode
                          ? "border border-white/8 bg-white/6 text-zinc-100"
                          : "border border-black/8 bg-white text-zinc-800"
                    }`}
                  >
                    {message.content ? (
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    )}
                  </div>

                  {message.role === "user" ? (
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-xs font-semibold text-white">
                      You
                    </div>
                  ) : null}
                </div>
              ))
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="pointer-events-none sticky bottom-0 px-3 pb-4 pt-2 sm:px-4">
          <div className="pointer-events-auto mx-auto w-full max-w-4xl">
            <div className={`rounded-[30px] border px-4 py-3 shadow-lg transition ${
              darkMode ? "border-white/10 bg-transparent" : "border-black/10 bg-transparent"
            }`}>
              <textarea
                ref={textareaRef}
                rows={1}
                className={`max-h-[220px] min-h-[44px] w-full resize-none cursor-text bg-transparent text-sm outline-none ${
                  darkMode ? "text-zinc-100 placeholder:text-zinc-500" : "text-zinc-900 placeholder:text-zinc-400"
                }`}
                placeholder="Message MedAI..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
              />

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-xs ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  Enter to send. Shift + Enter for a new line.
                </p>

                <div className="flex items-center gap-2">
                  {loading ? (
                    <button
                      onClick={handleStop}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
                        darkMode ? "bg-white/8 text-zinc-100 hover:bg-white/12" : "bg-zinc-900 text-white hover:bg-zinc-800"
                      }`}
                    >
                      Stop
                    </button>
                  ) : null}

                  <button
                    onClick={() => void handleSend()}
                    disabled={!input.trim() || loading}
                    className="cursor-pointer rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:bg-zinc-600 disabled:text-zinc-300 disabled:hover:bg-zinc-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
