export default function KpiCard({ label, value, sublabel }) {
  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-surface)]">
      <div className="text-xs text-[var(--color-ink)]/50 mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sublabel && <div className="text-xs text-[var(--color-ink)]/40 mt-1">{sublabel}</div>}
    </div>
  );
}