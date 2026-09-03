import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { api } from '../../lib/api.js';

export default function ApprovalsPage() {
  const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;
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
  }, [appUser]);

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
      <h1 className="text-xl font-semibold mb-1">Approvals</h1>
      <p className="text-sm text-[var(--color-ink)]/60 mb-6">
        Orders that tripped a safety rule and need your sign-off before payment.
      </p>

      {loading && <div className="text-sm text-[var(--color-ink)]/50">Loading…</div>}
      {error && <div className="text-sm text-[var(--color-danger)] mb-3">{error}</div>}

      {!loading && orders.length === 0 && (
        <div className="text-sm text-[var(--color-ink)]/50">Nothing pending — all clear.</div>
      )}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-surface)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">{o.items.map((i) => i.name).join(', ')}</div>
                <div className="text-xs text-[var(--color-ink)]/50 mt-0.5">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-sm font-semibold whitespace-nowrap">₹{o.amount}</div>
            </div>

            <p className="text-xs text-[var(--color-ink)]/60 mt-2 border-l-2 border-[var(--color-warning)] pl-2">
              {o.safetyReason}
            </p>

            <div className="flex gap-2 mt-3">
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