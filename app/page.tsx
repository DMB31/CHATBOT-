"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Bonjour! Je suis votre assistant immobilier J'achète en Algérie. Comment puis-je vous aider aujourd'hui?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const [composerHeight, setComposerHeight] = useState<number>(0);

  // Using server API proxy; no direct client in the browser
  const clientPromise = useMemo(() => null, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (!composerRef.current) return;
    const element = composerRef.current;
    const updateHeight = () => setComposerHeight(element.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }
      const { reply } = await res.json();
      const botMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: typeof reply === "string" ? reply : JSON.stringify(reply),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const botMessage: ChatMessage = {
        id: `${Date.now()}-assistant-error`,
        role: "assistant",
        content: "Désolé, une erreur s'est produite. Réessayez plus tard.",
      };
      setMessages((prev) => [...prev, botMessage]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top spacer to keep same spacing as removed header */}
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6" aria-hidden="true" />

      {/* Chat Window */}
      <main className="mx-auto flex w-full max-w-5xl grow flex-col px-0 sm:px-4">
        <div
          ref={scrollRef}
          className="nice-scrollbar scroll-smooth grow overflow-y-auto px-2 py-3 sm:px-4 sm:py-4"
          style={{ paddingBottom: `calc(${composerHeight}px + env(safe-area-inset-bottom, 0px) + 8px)` }}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 sm:gap-3">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-3 text-[15px] shadow-soft border ${
                      m.role === "assistant"
                        ? "w-full max-w-none sm:max-w-[75%]"
                        : "max-w-[92%] sm:max-w-[75%]"
                    } sm:px-4 sm:text-sm ${
                      m.role === "user"
                        ? "bg-[#004b5d] text-white rounded-br-none border-[#012F4D]"
                        : "bg-[#F8F9FA] text-[#1a1a1a] rounded-bl-none border-gray-200"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-smm max-w-none space-y-4 prose-p:my-2 prose-ol:my-3 prose-ul:my-0 prose-li:my-1 prose-a:no-underline prose-strong:text-inherit"
                        components={{
                          a: ({ node, href, children, ...props }) => {
                            const url = typeof href === "string" ? href : "";
                            let label = url;
                            try {
                              const u = new URL(url);
                              label = `${u.hostname}${u.pathname.replace(/\/$/, "")}` || u.hostname;
                            } catch {}
                            const hasCustomText = Array.isArray(children) && children.some((c) => typeof c === "string" && c.trim() && c !== url);
                            return (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#f05a2b] underline decoration-[#f05a2b]/30 hover:decoration-[#f05a2b] transition-all"
                                {...props}
                              >

                                <span className="truncate">
                                  {hasCustomText ? children : label}
                                </span>
                              </a>
                            );
                          },
                        }}
                      >
                        {m.content
                          .replace(/&#0*38;|&amp;/g, "&")
                          .replace(/\\n/g, "\n")
                          .replace(/\n{3,}/g, "\n\n")}
                      </ReactMarkdown>
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-none bg-white border border-gray-200 px-4 py-3 shadow-soft" aria-label="Assistant en train d'écrire">
                  <span className="h-3 w-3 rounded-full bg-[#004b5d] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-3 w-3 rounded-full bg-[#004b5d] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-3 w-3 rounded-full bg-[#004b5d] animate-bounce"></span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div
          ref={composerRef}
          className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-3 py-2 sm:px-6 sm:py-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
        >
          <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 pr-12 text-[15px] outline-none transition focus:border-brand.teal focus:bg-white sm:px-4 sm:text-sm"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              aria-label="Envoyer"
              className="h-11 w-11 rounded-xl bg-[#004b5d] text-white shadow-soft transition hover:bg-[#012F4D] disabled:cursor-not-allowed disabled:opacity-100 ring-1 ring-[#004b5d]/30 disabled:ring-2 disabled:ring-[#004b5d]/40 flex items-center justify-center"
            >
              <span className="sr-only">Envoyer</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <div className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-gray-400">
            Propulsé par <span className="font-medium text-brand.orange">J'achète en Algérie</span>
          </div>
        </div>
      </main>
    </div>
  );
}


