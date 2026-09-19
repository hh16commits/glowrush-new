import ProductCollectionPage from "./ProductCollectionPage";

export default function BestsellersPage() {
  return (
    <ProductCollectionPage
      eyebrow="GLOWRUSH BESTSELLERS"
      title="Бестселлеры"
      description="Самые популярные средства корейского ухода, которые выбирают наши клиенты."
      filterProducts={(product) => product.isBestseller}
    />
  );
}
