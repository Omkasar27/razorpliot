import { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { api } from '../../lib/api.js';
import StatusBadge from '../../components/merchant/StatusBadge.jsx';
import { PageHeader } from '../../components/ui/page-header.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';

const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;

export default function OrdersPage() {
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
      <PageHeader title="Orders" description="All customer orders, most recent first." />

      {loading && <div className="text-sm text-[var(--color-ink)]/50">Loading…</div>}
      {error && <div className="text-sm text-[var(--color-danger)]">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="No orders yet"
          description="Orders placed by customers through the shopping experience will show up here."
        />
      )}

      {!loading && orders.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)] shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)] text-left text-xs text-[var(--color-ink)]/50">
              <tr>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Items</th>
                <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/70">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-[var(--color-surface-muted)]/70 transition-colors">
                  <td className="px-4 py-3 text-[var(--color-ink)]/70 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{o.items.map((i) => i.name).join(', ')}</td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap text-right tabular-nums">₹{o.amount}</td>
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