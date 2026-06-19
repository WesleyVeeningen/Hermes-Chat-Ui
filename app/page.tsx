'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Role = 'user' | 'assistant';

export default function Page() {
  const [messages, setMessages] = useState<{ role: Role; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_HERMES_API_URL || '/', []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setSending(true);
    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      const reply =
        typeof data === 'string'
          ? data
          : data?.text || data?.content || data?.message || JSON.stringify(data);
      setMessages((m) => [...m, { role: 'assistant', text: String(reply) }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: `Error: ${String(err)}` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6 border-b border-neutral-800 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-orange-500">Hermes Chat</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Chat UI for Hermes — reads from <code className="text-neutral-300">NEXT_PUBLIC_HERMES_API_URL</code>.
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Status:{' '}
            {String(baseUrl).length > 0 ? (
              <span className="text-emerald-400">running</span>
            ) : (
              <span className="text-red-400">no API URL set</span>
            )}
          </p>
        </header>

        <section
          ref={chatRef}
          className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 h-[60vh] overflow-y-auto"
          aria-label="chat"
        >
          {messages.length === 0 ? (
            <p className="text-center text-sm text-neutral-500">No messages yet.</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-lg bg-neutral-800 px-3 py-2 text-sm'
                    : 'mr-auto max-w-[85%] rounded-lg bg-neutral-800/60 px-3 py-2 text-sm'
                }
              >
                <p className="mb-1 text-xs text-neutral-400">{msg.role}</p>
                <p className="whitespace-pre-wrap text-neutral-100">{msg.text}</p>
              </div>
            ))
          )}
          {sending && (
            <div className="mr-auto rounded-lg bg-neutral-800/60 px-3 py-2 text-sm text-neutral-400">
              Hermes is thinking…
            </div>
          )}
        </section>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (sending) return;
            send();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Hermes"
            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  );
}
