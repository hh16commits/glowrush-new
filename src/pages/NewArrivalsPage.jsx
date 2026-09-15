import { useCallback } from "react";
import ProductCollectionPage from "./ProductCollectionPage";

export default function NewArrivalsPage() {
  const filterProducts = useCallback(
    (product) => product.isNew === true,
    []
  );

  return (
    <ProductCollectionPage
      eyebrow="JUST ARRIVED"
      title="Новинки"
      description="Свежие продукты, которые только появились в GlowRush."
      filterProducts={filterProducts}
    />
  );
}
