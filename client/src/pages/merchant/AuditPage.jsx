import { useEffect, useState, useCallback } from 'react';
import { ScrollText } from 'lucide-react';
import { api } from '../../lib/api.js';
import { PageHeader } from '../../components/ui/page-header.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Button } from '../../components/ui/button.jsx';

const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;

const ACTOR_STYLES = {
  ai: 'text-[var(--color-accent)]',
  system: 'text-[var(--color-ink)]/50',
  merchant: 'text-[var(--color-success)]',
  customer: 'text-[var(--color-warning)]',
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!MERCHANT_ID) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ merchantId: MERCHANT_ID, limit: '200' });
      if (orderIdFilter.trim()) params.set('orderId', orderIdFilter.trim());
      const res = await api.get(`/audit?${params.toString()}`);
      setLogs(res.logs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderIdFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Audit trail"
        description="Every AI decision and system action, in order, with a plain-language reason."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex gap-2 mb-6"
      >
        <input
          value={orderIdFilter}
          onChange={(e) => setOrderIdFilter(e.target.value)}
          placeholder="Filter by order ID (optional)"
          className="border border-[var(--color-border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] w-72 bg-[var(--color-surface)]"
        />
        <Button type="submit" variant="outline" size="sm">
          Filter
        </Button>
        {orderIdFilter && (
          <button
            type="button"
            onClick={() => setOrderIdFilter('')}
            className="text-sm text-[var(--color-ink)]/50 hover:text-[var(--color-ink)]"
          >
            Clear
          </button>
        )}
      </form>

      {loading && <div className="text-sm text-[var(--color-ink)]/50">Loading…</div>}
      {error && <div className="text-sm text-[var(--color-danger)]">{error}</div>}
      {!loading && logs.length === 0 && (
        <EmptyState
          icon={ScrollText}
          title="No activity yet"
          description="Every AI decision and system action will appear here as soon as something happens."
        />
      )}

      {!loading && logs.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-5">
          <ol className="relative border-l border-[var(--color-border)] pl-4 space-y-4">
            {logs.map((log) => (
              <li key={log._id}>
                <div className="absolute -left-[5px] mt-1.5 w-2 h-2 rounded-full bg-[var(--color-border)]" />
                <div className="text-xs text-[var(--color-ink)]/40">
                  {new Date(log.ts).toLocaleString()}
                  <span className={`ml-2 font-medium ${ACTOR_STYLES[log.actor] || ''}`}>{log.actor}</span>
                  <span className="ml-2 text-[var(--color-ink)]/30">{log.action}</span>
                </div>
                <div className="text-sm mt-0.5">{log.reason}</div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}