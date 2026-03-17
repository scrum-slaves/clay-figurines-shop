import { Navigate, createBrowserRouter } from "react-router-dom";

import { EmptyCartState } from "../components/cart/EmptyCartState";
import { PageContainer } from "../components/layout/PageContainer";
import { StoreLayout } from "../components/layout/StoreLayout";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ProductsPage } from "../pages/ProductsPage";

function NotFoundPage() {
  return (
    <PageContainer
      description="Похоже, страница была перемещена или ссылка указана неверно."
      eyebrow="404"
      title="Страница не найдена"
    >
      <EmptyCartState
        description="Вернитесь в каталог и продолжите просмотр магазина."
        title="Такого маршрута в витрине сейчас нет."
      />
    </PageContainer>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <StoreLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/products" />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "products/:id",
        element: <ProductDetailsPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
