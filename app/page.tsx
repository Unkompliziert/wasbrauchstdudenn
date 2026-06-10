"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Page() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [delegationCode, setDelegationCode] = useState<string | null>(null);
  const [awaitingDelegationConfirm, setAwaitingDelegationConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, pending]);

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

    const now = new Date();
    const current_time = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const current_date = now.toLocaleDateString("de-DE");

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          session_id: sessionId,
          awaiting_delegation_confirm: awaitingDelegationConfirm,
          current_time,
          current_date,
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        done?: boolean;
        session_id?: string;
        delegation_code?: string;
        is_delegation_question?: boolean;
      };
      if (data.session_id && !sessionId) setSessionId(data.session_id);
      if (data.is_delegation_question) setAwaitingDelegationConfirm(true);
      if (data.delegation_code) {
        setDelegationCode(data.delegation_code);
        setAwaitingDelegationConfirm(false);
      }
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

        {messages.length > 0 && (
          <div className="conv-thread">
            {messages.map((m, i) => (
              <p
                key={i}
                className={m.role === "user" ? "conv-user" : "conv-assistant"}
              >
                {m.content}
              </p>
            ))}
            {pending && <p className="conv-assistant conv-pending">…</p>}
          </div>
        )}

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

        {done && (
          <p className="conv-close">
            {delegationCode ? "Ich melde mich." : "Du kannst morgen wiederkommen."}
          </p>
        )}

        <div ref={bottomRef} />
      </div>
    </main>
  );
}