"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { profile } from "@/data/profile";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const WELCOME_ID = "welcome";

const STARTER_PROMPTS = [
  "What's your current role?",
  "Walk me through your career path",
  "What technologies do you work with?",
];

function parseSseChunk(chunk: string): string {
  let text = "";
  for (const line of chunk.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const data = line.slice(6).trim();
    if (data === "[DONE]") continue;
    try {
      const json = JSON.parse(data) as {
        choices?: { delta?: { content?: string } }[];
      };
      const delta = json.choices?.[0]?.delta?.content;
      if (delta) text += delta;
    } catch {
      // skip malformed SSE lines
    }
  }
  return text;
}

function toApiHistory(messages: Message[]): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter(
      (m) =>
        m.id !== WELCOME_ID &&
        m.content.trim().length > 0 &&
        (m.role === "user" || m.role === "assistant"),
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }));
}

function ChatMessages({
  messages,
  loading,
  listRef,
}: {
  messages: Message[];
  loading: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {loading && messages[messages.length - 1]?.content === "" && (
        <div className="flex items-center gap-2 text-sm text-[#8b95a8]">
          <Loader2 size={14} className="animate-spin text-[#00e5c2]" />
          Thinking…
        </div>
      )}
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  loading,
  onSubmit,
  inputRef,
}: {
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-2 border-t border-white/[0.06] p-4 shrink-0"
    >
      <textarea
        ref={inputRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
          }
        }}
        placeholder="Ask about my career…"
        disabled={loading}
        className="max-h-24 flex-1 resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-[#f4f6fa] placeholder:text-[#8b95a8]/60 outline-none focus:border-[#00e5c2]/40 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00e5c2] text-[#06080c] disabled:opacity-40"
        aria-label="Send message"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </form>
  );
}

export function DigitalTwin() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: WELCOME_ID,
      role: "assistant",
      content: `Hey — I'm ${profile.name.split(" ")[0]}'s Digital Twin. Ask me about my career, skills, or how I got from manufacturing engineering to full-stack software.`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sectionListRef = useRef<HTMLDivElement>(null);
  const panelListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ref = panelOpen ? panelListRef : sectionListRef;
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages, loading, panelOpen]);

  useEffect(() => {
    if (panelOpen) inputRef.current?.focus();
  }, [panelOpen]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const apiHistory = [...toApiHistory(messages), { role: "user" as const, content: trimmed }];

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiHistory }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Something went wrong.");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream.");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += parseSseChunk(decoder.decode(value, { stream: true }));
        const snapshot = accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: snapshot } : m,
          ),
        );
      }

      if (!accumulated.trim()) {
        throw new Error("Empty response from Digital Twin.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get a response.";
      setError(message);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const promptRow = (
    <div className="flex flex-wrap gap-2 border-b border-white/[0.06] px-4 py-3 shrink-0">
      {STARTER_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={loading}
          onClick={() => sendMessage(prompt)}
          className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-[#8b95a8] transition-colors hover:border-[#00e5c2]/30 hover:text-[#f4f6fa] disabled:opacity-50"
        >
          {prompt}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <section id="twin" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="section-label mb-4">05 — Digital Twin</p>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Chat with my
                <span className="text-[#00e5c2]"> Digital Twin</span>
              </h2>
              <p className="mt-4 max-w-xl text-[#8b95a8]">
                An AI trained on my career profile — ask about roles, skills, or
                how I moved from Android and service engineering to full-stack
                web.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#00e5c2]/40 bg-[#00e5c2]/10 px-6 py-3 text-sm font-medium text-[#00e5c2] transition-all hover:bg-[#00e5c2]/20 lg:hidden"
            >
              <Sparkles size={16} />
              Expand chat
            </button>
          </div>

          <div className="mt-10 gradient-border hidden lg:flex lg:flex-col lg:h-[480px] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e5c2]/15">
                <Bot className="text-[#00e5c2]" size={18} />
              </div>
              <div>
                <p className="text-sm font-medium">Digital Twin</p>
                <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wider text-[#8b95a8]">
                  openai/gpt-oss-120b via OpenRouter
                </p>
              </div>
            </div>
            {promptRow}
            <ChatMessages
              messages={messages}
              loading={loading}
              listRef={sectionListRef}
            />
            {error && (
              <p className="px-4 pb-2 text-xs text-[#ff3366] shrink-0">{error}</p>
            )}
            <ChatInput
              input={input}
              setInput={setInput}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#00e5c2] text-[#06080c] shadow-[0_0_32px_rgba(0,229,194,0.35)] transition-transform hover:scale-105 lg:bottom-8 lg:right-8"
        aria-label="Open Digital Twin chat"
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-h-[min(640px,calc(100vh-2rem))] max-w-lg flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1018] shadow-2xl sm:inset-x-auto sm:right-8 sm:bottom-8 sm:left-auto sm:top-auto sm:h-[min(640px,calc(100vh-4rem))] sm:w-[400px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e5c2]/15">
                    <Bot className="text-[#00e5c2]" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Digital Twin</p>
                    <p className="text-xs text-[#8b95a8]">
                      {profile.name.split(" ")[0]}&apos;s career AI
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="rounded-lg p-1.5 text-[#8b95a8] hover:bg-white/[0.06] hover:text-[#f4f6fa]"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
              {promptRow}
              <ChatMessages
                messages={messages}
                loading={loading}
                listRef={panelListRef}
              />
              {error && (
                <p className="px-4 pb-2 text-xs text-[#ff3366] shrink-0">{error}</p>
              )}
              <ChatInput
                input={input}
                setInput={setInput}
                loading={loading}
                onSubmit={handleSubmit}
                inputRef={inputRef}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#00e5c2]/15 text-[#f4f6fa] rounded-br-md"
            : "bg-white/[0.04] text-[#c8d0de] rounded-bl-md border border-white/[0.06]"
        }`}
      >
        {message.content || (
          <span className="inline-block h-4 w-12 animate-pulse rounded bg-white/10" />
        )}
      </div>
    </div>
  );
}
