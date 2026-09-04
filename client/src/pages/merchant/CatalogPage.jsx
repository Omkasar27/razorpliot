import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Power, Package } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import ProductForm from '../../components/merchant/ProductForm.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Button } from '../../components/ui/button.jsx';
import { PageHeader } from '../../components/ui/page-header.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';

const MERCHANT_ID = import.meta.env.VITE_DEMO_MERCHANT_ID;

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!MERCHANT_ID) return;
    setLoading(true);
    try {
      const res = await api.get(`/merchant/products?merchantId=${MERCHANT_ID}`);
      setProducts(res.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data) {
    setBusy(true);
    try {
      await api.post('/merchant/products', { ...data, merchantId: MERCHANT_ID });
      setFormMode(null);
      toast.success('Product added');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id, data) {
    setBusy(true);
    try {
      await api.put(`/merchant/products/${id}`, data);
      setFormMode(null);
      toast.success('Product updated');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(product) {
    setBusy(true);
    try {
      if (product.active) {
        await api.del(`/merchant/products/${product._id}`);
        toast.success(`${product.name} deactivated`);
      } else {
        await api.put(`/merchant/products/${product._id}`, { active: true });
        toast.success(`${product.name} activated`);
      }
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isEditing = formMode && formMode !== 'create';
  const dialogOpen = Boolean(formMode);

  if (!MERCHANT_ID) {
    return (
      <div className="text-sm text-[var(--color-danger)]">
        VITE_DEMO_MERCHANT_ID is not set in client/.env.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Catalog"
        description="Products available to the AI agent for search and recommendations."
        action={
          <Button size="sm" onClick={() => setFormMode('create')}>
            <Plus size={14} />
            Add product
          </Button>
        }
      />

      {error && <div className="text-sm text-[var(--color-danger)] mb-3">{error}</div>}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setFormMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit product' : 'Add product'}</DialogTitle>
          </DialogHeader>
          <ProductForm
            initial={isEditing ? formMode : undefined}
            onSubmit={isEditing ? (data) => handleUpdate(formMode._id, data) : handleCreate}
            onCancel={() => setFormMode(null)}
            busy={busy}
          />
        </DialogContent>
      </Dialog>

      {loading && <div className="text-sm text-[var(--color-ink)]/50">Loading…</div>}

      {!loading && products.length === 0 && (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product so the AI agent has something to search and recommend."
          action={
            <Button size="sm" variant="outline" onClick={() => setFormMode('create')}>
              <Plus size={14} />
              Add product
            </Button>
          }
        />
      )}

      {!loading && products.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)] shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)] text-left text-xs text-[var(--color-ink)]/50">
              <tr>
                <th className="px-4 py-2.5 font-medium"></th>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium text-right">Price</th>
                <th className="px-4 py-2.5 font-medium text-right">Inventory</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/70">
              {products.map((p) => (
                <tr
                  key={p._id}
                  className={`hover:bg-[var(--color-surface-muted)]/70 transition-colors ${!p.active ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="w-9 h-9 rounded-md bg-[var(--color-surface-muted)] overflow-hidden flex items-center justify-center shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={14} className="text-[var(--color-ink)]/25" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-[var(--color-ink)]/70">{p.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums">₹{p.price}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={p.inventory < 3 ? 'text-[var(--color-danger)]' : ''}>{p.inventory}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        p.active
                          ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-ink)]/50'
                      }`}
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setFormMode(p)}
                        title="Edit"
                        className="text-[var(--color-ink)]/50 hover:text-[var(--color-accent)]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => toggleActive(p)}
                        title={p.active ? 'Deactivate' : 'Activate'}
                        className="text-[var(--color-ink)]/50 hover:text-[var(--color-danger)]"
                      >
                        <Power size={14} />
                      </button>
                    </div>
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