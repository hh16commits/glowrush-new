import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";
import {
  canAddToCart,
} from "../lib/shop";

function pickTranslation(translations = []) {
  return (
    translations.find((item) => item.locale === "RU") ||
    translations[0] ||
    null
  );
}

export default function ProductCollectionPage({
  eyebrow,
  title,
  description,
  filterProducts,
}) {
  const { onAddToCart: addToCartFromApp } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("Product")
        .select(`
          id,
          sku,
          slug,
          price,
          oldPrice,
          rating,
          reviewCount,
          stockStatus,
          isActive,
          isNew,
          isBestseller,
          createdAt,
          brand:Brand (
            slug,
            translations:BrandTranslation (
              locale,
              name
            )
          ),
          category:Category (
            slug,
            translations:CategoryTranslation (
              locale,
              name
            )
          ),
          translations:ProductTranslation (
            locale,
            name,
            description
          ),
          images:ProductImage (
            url,
            altText,
            position,
            isPrimary
          )
        `)
        .eq("isActive", true)
        .order("createdAt", { ascending: false });

      if (!mounted) return;

      if (queryError) {
        console.error("Collection load error:", queryError);
        setError(queryError.message);
        setProducts([]);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((product) => {
        const brandTranslation = pickTranslation(
          product.brand?.translations
        );

        const categoryTranslation = pickTranslation(
          product.category?.translations
        );

        const productTranslation = pickTranslation(
          product.translations
        );

        const images = [...(product.images || [])].sort(
          (a, b) =>
            (a.position || 0) - (b.position || 0)
        );

        const primaryImage =
          images.find((image) => image.isPrimary) ||
          images[0];

        return {
          ...product,
          brand:
            brandTranslation?.name ||
            product.brand?.slug ||
            "",
          category:
            categoryTranslation?.name ||
            product.category?.slug ||
            "",
          name:
            productTranslation?.name ||
            product.slug,
          description:
            productTranslation?.description ||
            "Средство для ежедневного ухода за кожей.",
          image: primaryImage?.url || "",
        };
      });

      setProducts(mapped);
      setLoading(false);
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleProducts = useMemo(
    () => products.filter(filterProducts),
    [products, filterProducts]
  );

  const addToCart = (product) => {
    if (!canAddToCart(product)) {
      return;
    }

    addToCartFromApp(product);
  };

  return (
    <main className="collection-page">
      <section className="collection-hero">
        <p className="eyebrow">{eyebrow}</p>

        <h1>{title}</h1>

        <p>{description}</p>

        {!loading && (
          <span className="collection-count">
            {visibleProducts.length} товаров
          </span>
        )}
      </section>

      {loading ? (
        <section className="premium-catalog-state">
          <p>Загружаем GlowRush…</p>
        </section>
      ) : error ? (
        <section className="premium-catalog-state premium-catalog-error">
          <h2>Не удалось загрузить товары</h2>
          <p>{error}</p>
        </section>
      ) : visibleProducts.length === 0 ? (
        <section className="premium-catalog-state">
          <h2>Пока ничего нет</h2>
          <p>
            Здесь появятся товары, как только они будут
            добавлены в каталог.
          </p>
        </section>
      ) : (
        <section className="premium-product-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </section>
      )}
    </main>
  );
}







