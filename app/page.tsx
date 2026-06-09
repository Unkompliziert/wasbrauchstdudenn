"use client";

import { useEffect, useRef, useState } from "react";

// EP0 + Clarity/Concierge flows in one view.
// Turn 1: table-driven, no API cost. Turn 2+: Claude API via WAS-11.
// The question never moves. The conversation grows below it.
// "Das reicht fuer jetzt." is the end. Nothing follows it.

type DetectedRoute = "clarity" | "concierge" | "unclear" | null;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Page() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [detectedRoute, setDetectedRoute] = useState<DetectedRoute>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [delegationCode, setDelegationCode] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to reveal new content quietly — no animation, just keep the
  // input visible as the conversation grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, pending]);

  // Re-focus input after system responds so the user can keep typing.
  useEffect(() => {
    if (!pending && !done) inputRef.current?.focus();
  }, [pending, done]);

  async function submit() {
    const text = value.trim();
    if (!text || pending || done) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setValue("");
    setPending(true);

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, route: detectedRoute, session_id: sessionId }),
      });
      const data = (await res.json()) as {
        reply?: string;
        route?: DetectedRoute;
        done?: boolean;
        session_id?: string;
        delegation_code?: string;
      };
      if (data.route && detectedRoute === null) setDetectedRoute(data.route);
if (data.session_id && !sessionId) setSessionId(data.session_id);
if (data.delegation_code) setDelegationCode(data.delegation_code);
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply! },
        ]);
      }
      if (data.done) setDone(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Einen Moment hat es gebraucht. Schreib es gern nochmal.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  const isInitial = messages.length === 0 && !pending;

  return (
    <main className="ep0-stage">
      <div className="ep0-column">
        <h1 className="ep0-question">Was brauchst du denn?</h1>

        {/* Conversation thread — invisible until first reply arrives */}
        {messages.length > 0 && (
          <div className="conv-thread">
            {messages.map((m, i) => (
              <p
                key={i}
                className={
                  m.role === "user" ? "conv-user" : "conv-assistant"
                }
              >
                {m.content}
              </p>
            ))}
            {/* Minimal pending indicator — three dots, same register as text */}
            {pending && <p className="conv-assistant conv-pending">…</p>}
          </div>
        )}

        {/* Input — shown at all times until the session is done.
            On first load it matches EP0 exactly. After that it sits at
            the bottom of the thread, always ready. */}
{delegationCode && (
  <p className="conv-code">Dein Code: {delegationCode}</p>
)}
        {!done && (
          <input
            ref={inputRef}
            className="ep0-field"
            type="text"
            inputMode="text"
            enterKeyHint="send"
            autoFocus={isInitial}
            autoComplete="off"
            spellCheck={false}
            aria-label="Was brauchst du denn?"
            placeholder={isInitial ? "Ein Satz reicht." : ""}
            value={value}
            disabled={pending}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
          />
        )}

        {/* Screen 4 close — shown only when backend signals done.
            "Das reicht fuer jetzt." is the last system message in the thread.
            This line stands alone beneath it. Nothing else follows. */}
        {done && (
          <p className="conv-close">Du kannst morgen wiederkommen.</p>
        )}

        <div ref={bottomRef} />
      </div>
    </main>
  );
}
