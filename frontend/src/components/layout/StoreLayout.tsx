import { NavLink, Outlet } from "react-router-dom";

import { useCart } from "../../hooks/useCart";

function navLinkClassName(isActive: boolean): string {
  return `rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors ${
    isActive
      ? "border border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--panel-bg)]"
      : "border border-transparent text-[var(--text-muted)] hover:border-[var(--line)] hover:bg-white hover:text-[var(--text-primary)]"
  }`;
}

export function StoreLayout() {
  const { getTotalCount } = useCart();
  const cartCount = getTotalCount();

  return (
    <div className="min-h-screen bg-[var(--panel-bg)] px-4 py-5 text-[var(--text-primary)] sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1380px]">
        <div className="bg-[var(--panel-bg)] sm:p-2 lg:p-4">
          <header className="flex flex-col gap-5 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex flex-wrap items-center gap-2">
              <NavLink className={({ isActive }) => navLinkClassName(isActive)} to="/products">
                Каталог
              </NavLink>
              <NavLink className={({ isActive }) => navLinkClassName(isActive)} to="/checkout">
                Оформление
              </NavLink>
            </nav>
            <NavLink
              aria-label="Перейти в корзину"
              className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--text-primary)] bg-white text-[var(--text-primary)] transition-transform hover:-translate-y-0.5"
              to="/cart"
            >
              <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
                <path
                  d="M7.5 9.5V8a4.5 4.5 0 0 1 9 0v1.5M6 9.5h12l-.8 9.1a2 2 0 0 1-1.99 1.82H8.79A2 2 0 0 1 6.8 18.6L6 9.5Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
              <span className="absolute -right-1 -top-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[var(--text-primary)] px-1 text-[11px] font-semibold text-[var(--panel-bg)]">
                {cartCount}
              </span>
            </NavLink>
          </header>
          <main className="pt-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
