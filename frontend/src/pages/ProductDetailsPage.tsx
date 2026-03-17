import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getProductById } from "../api/products";
import { PageContainer } from "../components/layout/PageContainer";
import { ProductGallery } from "../components/product/ProductGallery";
import { ProductInfo } from "../components/product/ProductInfo";
import { LoadingBlock } from "../components/ui/LoadingBlock";
import { StatusCard } from "../components/ui/StatusCard";
import { useCart } from "../hooks/useCart";
import { ProductDetails } from "../types/models";

export function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart, getTotalCount, registerProducts } = useCart();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!id) {
        setError("Не удалось определить товар.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const nextProduct = await getProductById(id);

        if (!isMounted) {
          return;
        }

        setProduct(nextProduct);
        registerProducts([nextProduct]);
      } catch (errorValue) {
        if (!isMounted) {
          return;
        }

        setProduct(null);
        setError(errorValue instanceof Error ? errorValue.message : "Не удалось загрузить карточку товара.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  function handleAddToCart() {
    if (!product) {
      return;
    }

    addToCart(product, quantity);
    setNotice(`В корзину добавлено ${quantity} шт. товара «${product.title}».`);
  }

  return (
    <PageContainer
      actions={
        <Link
          className="inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-white"
          to="/cart"
        >
          Корзина ({getTotalCount()})
        </Link>
      }
      description="Рассмотрите со всех сторон, выберите количество и забирайте в корзину."
      eyebrow="Товар"
      title={product?.title || "Карточка товара"}
    >
      {notice ? (
        <div className="rounded-[24px] border border-[#b8d5c4] bg-[#f0fbf4] px-5 py-4 text-sm font-medium text-[#21573a]">
          {notice}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <LoadingBlock className="min-h-[640px]" />
          <LoadingBlock className="min-h-[640px]" />
        </div>
      ) : null}

      {!isLoading && error ? (
        <StatusCard
          action={
            <Link
              className="inline-flex items-center justify-center rounded-full border border-[var(--text-primary)] bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--panel-bg)] transition-colors hover:bg-[#34302b]"
              to="/products"
            >
              Вернуться в каталог
            </Link>
          }
          description={error}
          title="Товар не найден или недоступен."
          tone="error"
        />
      ) : null}

      {!isLoading && !error && product ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <ProductGallery images={product.images} title={product.title} />
          <ProductInfo
            onAddToCart={handleAddToCart}
            onQuantityChange={setQuantity}
            product={product}
            quantity={quantity}
          />
        </div>
      ) : null}
    </PageContainer>
  );
}
