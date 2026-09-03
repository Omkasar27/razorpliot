import { useState } from 'react';
import { useCart } from '../../hooks/useCart.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [status, setStatus] = useState('idle'); // idle | adding | added

  const outOfStock = product.inStock === false;

  async function handleAdd() {
    setStatus('adding');
    try {
      await addItem(product._id);
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('idle');
    }
  }

  return (
    <div className="border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-surface)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{product.name}</div>
          <div className="text-xs text-[var(--color-ink)]/50 mt-0.5">{product.category}</div>
        </div>
        <div className="text-sm font-semibold whitespace-nowrap">₹{product.price}</div>
      </div>

      {product.description && (
        <p className="text-xs text-[var(--color-ink)]/60 mt-2 line-clamp-2">{product.description}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className={`text-xs ${outOfStock ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
          {outOfStock ? 'Out of stock' : 'In stock'}
        </span>
        <button
          onClick={handleAdd}
          disabled={outOfStock || status === 'adding'}
          className="text-xs px-2 py-1 rounded-md border border-[var(--color-accent)] text-[var(--color-accent)] disabled:opacity-50 hover:bg-[var(--color-accent-dim)]"
        >
          {status === 'added' ? 'Added ✓' : status === 'adding' ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}