import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { api } from '../../lib/api.js';
import StatusBadge from '../../components/merchant/StatusBadge.jsx';

export default function OrdersPage() {

  const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;
  const { appUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    useEffect(() => {
    if (!MERCHANT_ID) return;
    setLoading(true);
    api
      .get(`/orders?merchantId=${MERCHANT_ID}`)
      .then((res) => setOrders(res.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [appUser]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Orders</h1>
      <p className="text-sm text-[var(--color-ink)]/60 mb-6">All customer orders, most recent first.</p>

      {loading && <div className="text-sm text-[var(--color-ink)]/50">Loading…</div>}
      {error && <div className="text-sm text-[var(--color-danger)]">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="text-sm text-[var(--color-ink)]/50">No orders yet.</div>
      )}

      {!loading && orders.length > 0 && (
        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)] text-left text-xs text-[var(--color-ink)]/50">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Items</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3 text-[var(--color-ink)]/70 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{o.items.map((i) => i.name).join(', ')}</td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">₹{o.amount}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.approvalStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}