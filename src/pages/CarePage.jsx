import { useCallback } from "react";
import ProductCollectionPage from "./ProductCollectionPage";

const CARE_CATEGORIES = [
  "Очищение",
  "Тонеры",
  "Эссенции",
  "Сыворотки",
  "Кремы",
  "SPF",
  "Маски",
];

export default function CarePage() {
  const filterProducts = useCallback(
    (product) =>
      CARE_CATEGORIES.includes(product.category),
    []
  );

  return (
    <ProductCollectionPage
      eyebrow="DAILY SKINCARE"
      title="Уход"
      description="Подборка средств для ежедневной корейской рутины."
      filterProducts={filterProducts}
    />
  );
}
