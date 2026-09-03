import { useState } from 'react';

export default function ProductForm({ initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    category: initial?.category || '',
    price: initial?.price ?? '',
    inventory: initial?.inventory ?? '',
    tags: initial?.tags?.join(', ') || '',
    shippingInfo: initial?.shippingInfo || '',
    returnPolicy: initial?.returnPolicy || '',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      inventory: Number(form.inventory),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      shippingInfo: form.shippingInfo,
      returnPolicy: form.returnPolicy,
    });
  }

  const inputClass =
    'border border-[var(--color-border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] w-full';

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-surface)] space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--color-ink)]/60 mb-1 block">Name</label>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-[var(--color-ink)]/60 mb-1 block">Category</label>
          <input
            required
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-ink)]/60 mb-1 block">Price (₹)</label>
          <input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-ink)]/60 mb-1 block">Inventory</label>
          <input
            required
            type="number"
            min="0"
            value={form.inventory}
            onChange={(e) => update('inventory', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--color-ink)]/60 mb-1 block">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-xs text-[var(--color-ink)]/60 mb-1 block">Tags (comma-separated)</label>
        <input
          value={form.tags}
          onChange={(e) => update('tags', e.target.value)}
          className={inputClass}
          placeholder="gaming, mouse, wired"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--color-ink)]/60 mb-1 block">Shipping info</label>
          <input
            value={form.shippingInfo}
            onChange={(e) => update('shippingInfo', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-ink)]/60 mb-1 block">Return policy</label>
          <input
            value={form.returnPolicy}
            onChange={(e) => update('returnPolicy', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={busy}
          className="text-sm bg-[var(--color-accent)] text-white px-4 py-2 rounded-md disabled:opacity-50 hover:opacity-90"
        >
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Add product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm border border-[var(--color-border)] px-4 py-2 rounded-md hover:bg-[var(--color-surface-muted)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}