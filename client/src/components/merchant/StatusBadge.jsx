const STYLES = {
  paid: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  pending_payment: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  pending_approval: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  failed: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
  blocked: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
  approved: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  rejected: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
  pending: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  not_required: 'bg-[var(--color-surface-muted)] text-[var(--color-ink)]/50',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-[var(--color-surface-muted)] text-[var(--color-ink)]/50';
  const label = (status || '').replace(/_/g, ' ');
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full capitalize ${style}`}>{label}</span>
  );
}