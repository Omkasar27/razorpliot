import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.jsx';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet.jsx';
import { Button } from '../ui/button.jsx';

export default function CartDrawer() {
  const { cart, total, drawerOpen, setDrawerOpen, removeItem, loading } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <div className="text-sm text-[var(--color-ink)]/50">Loading…</div>}
          {!loading && cart.items.length === 0 && (
            <div className="text-sm text-[var(--color-ink)]/50">Your cart is empty.</div>
          )}
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] pb-3"
            >
              <div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-[var(--color-ink)]/50">
                  ₹{item.priceAtAdd} × {item.quantity}
                  {item.addedVia !== 'customer' && (
                    <span className="ml-1 text-[var(--color-accent)]">({item.addedVia})</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-[var(--color-ink)]/40 hover:text-[var(--color-danger)]"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-border)] p-4">
          <div className="flex items-center justify-between text-sm font-medium mb-3">
            <span>Total</span>
            <span className="tabular-nums">₹{total}</span>
          </div>
          <Button
            disabled={cart.items.length === 0}
            onClick={() => {
              setDrawerOpen(false);
              navigate('/checkout');
            }}
            className="w-full"
          >
            Proceed to checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}