import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { api } from '../../lib/api.js';
import { PageHeader } from '../../components/ui/page-header.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';

const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;

export default function ApprovalsPage() {
  const { appUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    if (!MERCHANT_ID) return;
    setLoading(true);
    try {
      const res = await api.get(`/approvals?merchantId=${MERCHANT_ID}`);
      setOrders(res.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(orderId, approve) {
    setBusyId(orderId);
    setError('');
    try {
      await api.post(`/approvals/${orderId}/decision`, {
        merchantId: MERCHANT_ID,
        approve,
        approverUserId: appUser._id,
      });
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Approvals"
        description="Orders that tripped a safety rule and need your sign-off before payment."
      />

      {loading && <div className="text-sm text-[var(--color-ink)]/50">Loading…</div>}
      {error && <div className="text-sm text-[var(--color-danger)] mb-3">{error}</div>}

      {!loading && orders.length === 0 && (
        <EmptyState icon={ShieldCheck} title="Nothing pending" description="All clear — no orders are waiting on your approval right now." />
      )}

      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o._id}
            className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">{o.items.map((i) => i.name).join(', ')}</div>
                <div className="text-xs text-[var(--color-ink)]/50 mt-0.5">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-sm font-semibold whitespace-nowrap tabular-nums">₹{o.amount}</div>
            </div>

            <p className="text-xs text-[var(--color-ink)]/60 mt-2.5 border-l-2 border-[var(--color-warning)] pl-2.5">
              {o.safetyReason}
            </p>

            <div className="flex gap-2 mt-3.5">
              <button
                onClick={() => decide(o._id, true)}
                disabled={busyId === o._id}
                className="text-xs px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white disabled:opacity-50 hover:opacity-90"
              >
                Approve
              </button>
              <button
                onClick={() => decide(o._id, false)}
                disabled={busyId === o._id}
                className="text-xs px-3 py-1.5 rounded-md border border-[var(--color-border)] disabled:opacity-50 hover:bg-[var(--color-surface-muted)]"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}