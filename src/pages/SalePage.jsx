import { useCallback } from "react";
import ProductCollectionPage from "./ProductCollectionPage";

export default function SalePage() {
  const filterProducts = useCallback(
    (product) =>
      Number(product.oldPrice || 0) >
      Number(product.price || 0),
    []
  );

  return (
    <ProductCollectionPage
      eyebrow="GLOWRUSH SALE"
      title="Акции"
      description="Любимые средства по специальной цене."
      filterProducts={filterProducts}
    />
  );
}
