import { Link, Outlet, createBrowserRouter } from "react-router-dom";

import { CartPage } from "../pages/CartPage";
import { CatalogPage } from "../pages/CatalogPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { ProductPage } from "../pages/ProductPage";


function RootLayout() {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-300 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link className="text-xl font-semibold" to="/">
            Clay Shop
          </Link>
          <nav className="flex gap-3 text-sm font-medium">
            <Link className="rounded px-2 py-1 hover:bg-stone-100" to="/">
              Каталог
            </Link>
            <Link className="rounded px-2 py-1 hover:bg-stone-100" to="/cart">
              Корзина
            </Link>
            <Link className="rounded px-2 py-1 hover:bg-stone-100" to="/checkout">
              Оформление
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}


function NotFoundPage() {
  return <p className="text-sm text-red-700">Страница не найдена.</p>;
}


export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: "product/:id", element: <ProductPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
