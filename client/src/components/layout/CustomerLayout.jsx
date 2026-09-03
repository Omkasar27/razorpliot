import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useCart } from '../../hooks/useCart.jsx';
import CartDrawer from '../customer/CartDrawer.jsx';

export default function CustomerLayout() {
  const { appUser, signOutUser } = useAuth();
  const { cart, setDrawerOpen } = useCart();
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">
            RazorPilot
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 text-[var(--color-ink)]/70 hover:text-[var(--color-ink)]"
            >
              <ShoppingCart size={16} />
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-[var(--color-accent)] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <span className="text-[var(--color-ink)]/40 hidden sm:inline">{appUser?.email}</span>
            <button
              onClick={signOutUser}
              className="flex items-center gap-1 text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
    </div>
  );
}