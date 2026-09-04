import AnimatedNumber from './AnimatedNumber.jsx';

export default function KpiCard({ label, value, prefix = '', suffix = '', decimals = 0, sublabel }) {
  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-surface)]">
      <div className="text-xs text-[var(--color-ink)]/50 mb-1">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {sublabel && <div className="text-xs text-[var(--color-ink)]/40 mt-1">{sublabel}</div>}
    </div>
  );
}