export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl border border-dashed border-[var(--color-border)]">
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center mb-3">
          <Icon size={18} className="text-[var(--color-ink)]/35" />
        </div>
      )}
      <div className="text-sm font-medium text-[var(--color-ink)]/80">{title}</div>
      {description && <p className="text-xs text-[var(--color-ink)]/50 mt-1.5 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}