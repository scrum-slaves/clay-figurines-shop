import { Button } from "../ui/Button";

type AddToCartButtonProps = {
  disabled?: boolean;
  onClick: () => void;
  fullWidth?: boolean;
};

export function AddToCartButton({
  disabled = false,
  onClick,
  fullWidth = false,
}: AddToCartButtonProps) {
  return (
    <Button data-testid="product-detail-add-to-cart" disabled={disabled} fullWidth={fullWidth} onClick={onClick}>
      Добавить в корзину
    </Button>
  );
}
