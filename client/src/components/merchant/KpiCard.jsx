import AnimatedNumber from './AnimatedNumber.jsx';

export default function KpiCard({ label, value, prefix = '', suffix = '', decimals = 0, sublabel }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <div className="text-xs text-[var(--color-ink)]/50 mb-1.5">{label}</div>
      <div className="text-[1.65rem] font-semibold tabular-nums tracking-tight">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {sublabel && <div className="text-xs text-[var(--color-ink)]/40 mt-1">{sublabel}</div>}
    </div>
  );
}