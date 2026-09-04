export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7">
      <div>
        <h1 className="text-[1.35rem] font-semibold tracking-tight text-[var(--color-ink)]">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--color-ink)]/55 mt-1 max-w-lg leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}