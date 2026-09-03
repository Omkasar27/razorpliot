import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkHealth } from '../lib/api.js';

const PIPELINE = [
  'Customer describes what they need',
  'AI searches your catalog',
  'AI recommends the right add-on',
  'Code checks your safety rules',
  'You approve, if the rules ask you to',
  'Razorpay checkout completes',
  'Every step is logged, with a reason',
];

const NOT_A_CHATBOT = [
  {
    title: 'A chatbot',
    points: [
      'Answers questions about products',
      'Sends the customer to checkout on their own',
      "Can't tell you why it said what it said",
      'Has no limit on what it recommends or offers',
    ],
  },
  {
    title: 'RazorPilot',
    points: [
      'Finds the product and completes the order',
      'Creates the Razorpay checkout itself',
      'Explains every recommendation and every charge',
      'Stays inside limits you set, with your approval when it matters',
    ],
  },
];

const CAPABILITIES = [
  {
    title: 'Explainable money actions',
    body: 'Every order, discount, and charge comes with a plain-language reason — what happened, why, and whether a safety rule applied.',
  },
  {
    title: 'Bounded, gated AI',
    body: 'Thresholds for order size, discounts, and low inventory are enforced in code, not by the model. The AI can suggest; it can never override a rule.',
  },
  {
    title: 'A complete audit trail',
    body: 'From the first message to the final payment, every step is timestamped and recorded — searchable by order or by conversation.',
  },
  {
    title: 'Graceful payment recovery',
    body: 'A failed payment gets one retry within a limit you control, then stops and notifies you — never a silent failure or an endless loop.',
  },
];

export default function LandingPage() {
  const [health, setHealth] = useState({ state: 'checking' });

  useEffect(() => {
    checkHealth()
      .then((data) => setHealth({ state: 'ok', data }))
      .catch((err) => setHealth({ state: 'error', message: err.message }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">RazorPilot</span>
          <Link
            to="/login"
            className="text-sm text-[var(--color-ink)]/70 hover:text-[var(--color-ink)]"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-[2.75rem] leading-[1.15] font-semibold tracking-tight mb-5">
            An AI agent that sells for your store — inside limits you control.
          </h1>
          <p className="text-base text-[var(--color-ink)]/60 mb-8 max-w-md">
            RazorPilot talks to your customers, searches your catalog, suggests the right
            add-on, and completes checkout with Razorpay. Every order stays inside rules you
            set, and every decision is explained.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="text-sm font-medium bg-[var(--color-accent)] text-white px-5 py-2.5 rounded-md hover:opacity-90"
            >
              Try the demo
            </Link>
            <Link
              to="/merchant"
              className="text-sm font-medium border border-[var(--color-border)] px-5 py-2.5 rounded-md hover:bg-[var(--color-surface-muted)]"
            >
              View the merchant dashboard
            </Link>
          </div>
        </div>

        <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] p-5">
          <div className="text-xs text-[var(--color-ink)]/50 mb-4">How one order happens</div>
          <ol className="relative border-l border-[var(--color-border)] pl-4 space-y-3.5">
            {PIPELINE.map((step, i) => (
              <li key={i} className="relative">
                <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <div className="text-sm text-[var(--color-ink)]/80">{step}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Not a chatbot */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-xl font-semibold mb-1">Agentic commerce, not a chatbot</h2>
          <p className="text-sm text-[var(--color-ink)]/60 mb-8 max-w-md">
            Chat is one way a customer reaches RazorPilot. It isn't the product.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {NOT_A_CHATBOT.map((col) => (
              <div
                key={col.title}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5"
              >
                <div className="text-sm font-medium mb-3">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.points.map((point) => (
                    <li key={point} className="text-sm text-[var(--color-ink)]/70 flex gap-2">
                      <span className="text-[var(--color-ink)]/30">—</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-xl font-semibold mb-8">What makes it safe to hand off</h2>
        <div className="border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-border)]">
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className="p-5 md:flex md:items-baseline md:gap-8">
              <div className="text-sm font-medium md:w-56 shrink-0 mb-1 md:mb-0">{cap.title}</div>
              <div className="text-sm text-[var(--color-ink)]/60">{cap.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-[var(--color-ink)]/40">
          <span>Built for the Razorpay Buildathon — Track 01: AI Growth &amp; Agentic Commerce.</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health.state === 'ok'
                  ? 'bg-[var(--color-success)]'
                  : health.state === 'error'
                    ? 'bg-[var(--color-danger)]'
                    : 'bg-[var(--color-ink)]/30'
              }`}
            />
            {health.state === 'ok' ? 'API connected' : health.state === 'error' ? 'API unreachable' : 'Checking…'}
          </span>
        </div>
      </footer>
    </div>
  );
}