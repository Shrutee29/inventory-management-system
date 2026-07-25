import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const navBase = 'rounded-full px-4 py-2 text-sm font-medium transition';

export default function Layout() {
  const { user, logout, isAdmin, roleLabel } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-900/75 backdrop-blur-xl">
        <div className="page-shell flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="title-font text-2xl font-bold tracking-tight text-white">Inventory Flow</p>
            <p className="text-sm text-slate-400">Products, orders, and stock in one control surface.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {user?.username} · {roleLabel}
            </div>
            <div className="rounded-full border border-accent-400/30 bg-accent-500/10 px-4 py-2 text-sm text-accent-100">
              Cart {itemCount}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-sand-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="page-shell grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="glass-panel rounded-3xl p-4">
          <nav className="flex flex-col gap-2">
            {isAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `${navBase} ${isActive ? 'bg-accent-500 text-white' : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'}`}
              >
                Dashboard
              </NavLink>
            )}
            <NavLink
              to="/products"
              className={({ isActive }) => `${navBase} ${isActive ? 'bg-accent-500 text-white' : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'}`}
            >
              Products
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) => `${navBase} ${isActive ? 'bg-accent-500 text-white' : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'}`}
            >
              Orders
            </NavLink>
          </nav>

          <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Session</p>
            <p className="mt-2 text-sm text-slate-200">{isAdmin ? 'Admin workspace with stock control and analytics.' : 'Customer workspace for browsing and checkout.'}</p>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}