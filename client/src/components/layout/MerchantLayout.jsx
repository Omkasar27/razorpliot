import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Receipt,
  ShieldCheck,
  ScrollText,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';

const navItems = [
  { to: '/merchant', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/merchant/catalog', label: 'Catalog', icon: Package },
  { to: '/merchant/orders', label: 'Orders', icon: Receipt },
  { to: '/merchant/approvals', label: 'Approvals', icon: ShieldCheck },
  { to: '/merchant/audit', label: 'Audit trail', icon: ScrollText },
  { to: '/merchant/safety-rules', label: 'Safety rules', icon: SlidersHorizontal },
];

export default function MerchantLayout() {
  const { appUser, signOutUser } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col">
        <div className="font-semibold tracking-tight px-2 mb-6">RazorPilot</div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${
                  isActive
                    ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-medium'
                    : 'text-[var(--color-ink)]/70 hover:bg-[var(--color-surface-muted)]'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[var(--color-border)] pt-3 px-2">
          <div className="text-xs text-[var(--color-ink)]/50 mb-2 truncate">{appUser?.email}</div>
          <button
            onClick={signOutUser}
            className="flex items-center gap-2 text-sm text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}