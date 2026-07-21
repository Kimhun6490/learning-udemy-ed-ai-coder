"use client";

import { FormEvent, useState } from "react";
import { sendAiChat } from "@/lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AiSidebarProps = {
  onBoardUpdated: () => void;
};

export const AiSidebar = ({ onBoardUpdated }: AiSidebarProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextMessage = input.trim();
    if (!nextMessage || isSending) {
      return;
    }

    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: nextMessage }]);
    setIsSending(true);

    try {
      const response = await sendAiChat(nextMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: response.assistantMessage }]);
      if (response.boardUpdated) {
        onBoardUpdated();
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "AI request failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside className="border-l border-[var(--stroke)] bg-white/80 backdrop-blur lg:min-h-screen">
      <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--gray-text)]">
            AI Assistant
          </p>
          <h2 className="mt-2 font-display text-2xl text-[var(--navy-dark)]">Board Copilot</h2>
          <p className="mt-2 text-sm text-[var(--gray-text)]">
            Ask to create, edit, or move cards and the board will update automatically.
          </p>
        </div>

        <div className="mt-5 flex-1 overflow-y-auto rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-[var(--gray-text)]">Try: Move QA micro-interactions to Done.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "ml-6 bg-[var(--primary-blue)] text-white"
                      : "mr-6 border border-[var(--stroke)] bg-white text-[var(--navy-dark)]"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask AI to update the board..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)]"
          />
          {error ? <p className="text-sm text-[var(--secondary-purple)]">{error}</p> : null}
          <button
            type="submit"
            disabled={isSending}
            className="w-full rounded-full bg-[var(--secondary-purple)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </aside>
  );
};
