import { useState } from 'react';
import { api } from '../../lib/api.js';
import { useCart } from '../../hooks/useCart.jsx';

export default function RecommendationCard({ recommendation }) {
  const { addItem } = useCart();
  const [status, setStatus] = useState(recommendation.accepted ?? null); // null | true | false
  const [busy, setBusy] = useState(false);

  async function decide(accepted) {
    setBusy(true);
    try {
      await api.post(`/recommendations/${recommendation.recommendationId}/decision`, { accepted });
      if (accepted) {
        await addItem(recommendation.recommendedProduct._id, { addedVia: recommendation.type });
      }
      setStatus(accepted);
    } catch {
      // Non-critical UI action — fail silently rather than blocking the shopping flow.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-dashed border-[var(--color-accent)]/40 rounded-lg p-3 bg-[var(--color-accent-dim)]">
      <div className="text-xs text-[var(--color-accent)] font-medium mb-1">Suggested add-on</div>
      <div className="text-sm font-medium">
        {recommendation.recommendedProduct.name} — ₹{recommendation.recommendedProduct.price}
      </div>
      <p className="text-xs text-[var(--color-ink)]/60 mt-1">{recommendation.reason}</p>

      {status === null && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => decide(true)}
            disabled={busy}
            className="text-xs px-2 py-1 rounded-md bg-[var(--color-accent)] text-white disabled:opacity-50 hover:opacity-90"
          >
            Add it
          </button>
          <button
            onClick={() => decide(false)}
            disabled={busy}
            className="text-xs px-2 py-1 rounded-md border border-[var(--color-border)] disabled:opacity-50 hover:bg-[var(--color-surface)]"
          >
            No thanks
          </button>
        </div>
      )}
      {status === true && <div className="text-xs text-[var(--color-success)] mt-2">Added to cart ✓</div>}
      {status === false && <div className="text-xs text-[var(--color-ink)]/40 mt-2">Skipped</div>}
    </div>
  );
}