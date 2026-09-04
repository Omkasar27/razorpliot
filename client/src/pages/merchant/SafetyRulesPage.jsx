import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { PageHeader } from '../../components/ui/page-header.jsx';
import { Button } from '../../components/ui/button.jsx';

const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;

export default function SafetyRulesPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!MERCHANT_ID) return;
    api
      .get(`/merchant/rules?merchantId=${MERCHANT_ID}`)
      .then((res) => setForm(res.rule))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.put('/merchant/rules', {
        merchantId: MERCHANT_ID,
        approvalThreshold: Number(form.approvalThreshold),
        maxDiscountPct: Number(form.maxDiscountPct),
        lowInventoryThreshold: Number(form.lowInventoryThreshold),
        maxRetryAttempts: Number(form.maxRetryAttempts),
      });
      setForm(res.rule);
      toast.success('Safety rules saved');
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'border border-[var(--color-border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] w-full bg-[var(--color-surface)]';

  if (loading) return <div className="text-sm text-[var(--color-ink)]/50">Loading…</div>;
  if (!form) {
    return <div className="text-sm text-[var(--color-danger)]">{error || 'Could not load safety rules.'}</div>;
  }

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Safety rules"
        description="These deterministic thresholds decide when the AI can act automatically versus needing your approval. The AI never overrides these."
      />

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
      >
        <div>
          <label className="text-sm font-medium block mb-1">Approval threshold (₹)</label>
          <p className="text-xs text-[var(--color-ink)]/50 mb-1.5">
            Orders at or above this amount require your approval.
          </p>
          <input
            type="number"
            min="0"
            value={form.approvalThreshold}
            onChange={(e) => update('approvalThreshold', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Max discount (%)</label>
          <p className="text-xs text-[var(--color-ink)]/50 mb-1.5">
            Discounts above this percentage require your approval.
          </p>
          <input
            type="number"
            min="0"
            max="100"
            value={form.maxDiscountPct}
            onChange={(e) => update('maxDiscountPct', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Low inventory threshold</label>
          <p className="text-xs text-[var(--color-ink)]/50 mb-1.5">
            Orders touching a product below this stock level require your approval.
          </p>
          <input
            type="number"
            min="0"
            value={form.lowInventoryThreshold}
            onChange={(e) => update('lowInventoryThreshold', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Payment retry attempts</label>
          <p className="text-xs text-[var(--color-ink)]/50 mb-1.5">
            How many times a failed payment can be retried before the order is marked failed.
          </p>
          <input
            type="number"
            min="0"
            value={form.maxRetryAttempts}
            onChange={(e) => update('maxRetryAttempts', e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <div className="text-sm text-[var(--color-danger)]">{error}</div>}

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save rules'}
        </Button>
      </form>
    </div>
  );
}