import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../../lib/api.js';
import KpiCard from '../../components/merchant/KpiCard.jsx';

const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!MERCHANT_ID) return;
    api
      .get(`/analytics?merchantId=${MERCHANT_ID}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-[var(--color-ink)]/50">Loading…</div>;
  if (error) return <div className="text-sm text-[var(--color-danger)]">{error}</div>;
  if (!data) return null;

  const conversionData = [
    { name: 'Upsell', value: data.upsellConversionRate },
    { name: 'Cross-sell', value: data.crossSellConversionRate },
    { name: 'Rec. acceptance', value: data.recommendationAcceptanceRate },
    { name: 'Payment recovery', value: data.paymentRecoveryRate },
  ];

  const lowSample = data.sampleSize.paidOrders < 3;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Overview</h1>
      <p className="text-sm text-[var(--color-ink)]/60 mb-6">
        AI-generated revenue and growth metrics, computed live from real orders.
      </p>

      {lowSample && (
        <div className="text-xs text-[var(--color-warning)] bg-[var(--color-warning)]/10 rounded-md px-3 py-2 mb-4">
          Small sample size ({data.sampleSize.paidOrders} paid order
          {data.sampleSize.paidOrders === 1 ? '' : 's'}) — demo/test data, treat percentages as
          illustrative.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="AI-generated revenue" value={`₹${data.totalRevenue}`} />
        <KpiCard label="AI-assisted orders" value={data.aiAssistedOrders} />
        <KpiCard label="Average order value" value={`₹${data.averageOrderValue}`} />
        <KpiCard label="Payment success rate" value={`${data.paymentSuccessRate}%`} />
      </div>

      <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-surface)]">
        <div className="text-sm font-medium mb-3">Conversion rates</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={conversionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="value" fill="#3B5BFD" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}