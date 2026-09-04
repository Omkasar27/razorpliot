import { useState } from 'react';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../hooks/useCart.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [status, setStatus] = useState('idle');
  const [imageFailed, setImageFailed] = useState(false);

  const outOfStock = product.inStock === false;
  const showImage = product.imageUrl && !imageFailed;

  async function handleAdd() {
    setStatus('adding');
    try {
      await addItem(product._id);
      setStatus('added');
      toast.success(`${product.name} added to cart`);
      setTimeout(() => setStatus('idle'), 1500);
    } catch (err) {
      toast.error(err.message || 'Could not add to cart.');
      setStatus('idle');
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <div className="aspect-[4/3] bg-[var(--color-surface-muted)] flex items-center justify-center overflow-hidden">
        {showImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Package size={28} className="text-[var(--color-ink)]/20" />
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-medium">{product.name}</div>
            <div className="text-xs text-[var(--color-ink)]/50 mt-0.5">{product.category}</div>
          </div>
          <div className="text-sm font-semibold whitespace-nowrap tabular-nums">₹{product.price}</div>
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
    </div>
  );
}