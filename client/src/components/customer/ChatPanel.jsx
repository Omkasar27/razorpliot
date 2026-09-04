import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

export default function ChatPanel({ messages, onSend, sending }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    onSend(text.trim());
    setText('');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-[var(--color-ink)]/50 text-center mt-10">
            Tell me what you're looking for — e.g. "I need a gaming mouse under ₹2000".
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`message-in flex gap-2 ${m.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={12} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.role === 'customer'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-ink)]'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="message-in flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={12} />
            </div>
            <div className="bg-[var(--color-surface-muted)] rounded-lg px-3 py-2.5 flex items-center gap-1">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-ink)]/40" style={{ animationDelay: '0ms' }} />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-ink)]/40" style={{ animationDelay: '150ms' }} />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-ink)]/40" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-[var(--color-border)] p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask for a product…"
          className="flex-1 border border-[var(--color-border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-[var(--color-accent)] text-white rounded-md px-3 py-2 disabled:opacity-50 hover:opacity-90"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}