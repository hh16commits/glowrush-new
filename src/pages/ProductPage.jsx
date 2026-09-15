import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Icon from "../components/Icon";

const formatPrice = (value) =>
  new Intl.NumberFormat("ru-RU").format(Number(value || 0));

function pickTranslation(translations = []) {
  return (
    translations.find((item) => item.locale === "RU") ||
    translations[0] ||
    null
  );
}

export default function ProductPage() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
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
          skinTypes,
          tags,
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
        .eq("slug", slug)
        .eq("isActive", true)
        .maybeSingle();

      if (!mounted) return;

      if (queryError) {
        console.error("Product load error:", queryError);
        setError(queryError.message);
        setProduct(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Товар не найден.");
        setProduct(null);
        setLoading(false);
        return;
      }

      const productTranslation = pickTranslation(
        data.translations
      );

      const brandTranslation = pickTranslation(
        data.brand?.translations
      );

      const categoryTranslation = pickTranslation(
        data.category?.translations
      );

      const images = [...(data.images || [])].sort(
        (a, b) => (a.position || 0) - (b.position || 0)
      );

      setProduct({
        ...data,
        name: productTranslation?.name || data.slug,
        description:
          productTranslation?.description ||
          "Средство для ежедневного ухода за кожей.",
        brand: brandTranslation?.name || data.brand?.slug || "",
        category:
          categoryTranslation?.name ||
          data.category?.slug ||
          "",
        images,
      });

      setLoading(false);
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const addToCart = () => {
    if (!product) return;

    let current = [];

    try {
      current =
        JSON.parse(localStorage.getItem("glowrush-cart")) || [];
    } catch {
      current = [];
    }

    const existing = current.find(
      (item) => item.id === product.id
    );

    const cartProduct = {
      id: product.id,
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.images?.[0]?.url || "",
      description: product.description,
      stockStatus: product.stockStatus,
    };

    const next = existing
      ? current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      : [
          ...current,
          {
            ...cartProduct,
            quantity: 1,
          },
        ];

    localStorage.setItem(
      "glowrush-cart",
      JSON.stringify(next)
    );

    window.dispatchEvent(
      new Event("glowrush:cart-updated")
    );

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  if (loading) {
    return (
      <main className="product-page">
        <div className="product-page-state">
          Загрузка товара…
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-page">
        <div className="product-page-state">
          <h1>Товар не найден</h1>
          <p>{error}</p>
          <Link to="/catalog">
            Вернуться в каталог
          </Link>
        </div>
      </main>
    );
  }

  const mainImage =
    product.images?.find((image) => image.isPrimary) ||
    product.images?.[0];

  return (
    <main className="product-page">
      <div className="product-breadcrumbs">
        <Link to="/">Главная</Link>
        <span>/</span>
        <Link to="/catalog">Каталог</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-main">
        <div className="product-gallery">
          {mainImage?.url ? (
            <img
              src={mainImage.url}
              alt={mainImage.altText || product.name}
            />
          ) : (
            <div className="product-gallery-placeholder">
              <span>GLOW</span>
              <small>RUSH</small>
            </div>
          )}
        </div>

        <div className="product-details">
          <p className="eyebrow">{product.brand}</p>

          <h1>{product.name}</h1>

          <p className="product-category">
            {product.category}
          </p>

          {product.rating ? (
            <div className="product-rating">
              ★ {product.rating}
              <span>
                {" "}
                · {product.reviewCount || 0} отзывов
              </span>
            </div>
          ) : null}

          <div className="product-price">
            <strong>
              {formatPrice(product.price)} сум
            </strong>

            {product.oldPrice > product.price && (
              <span>
                {formatPrice(product.oldPrice)} сум
              </span>
            )}
          </div>

          <p className="product-description">
            {product.description}
          </p>

          <button
            type="button"
            className="primary-button product-add-button"
            onClick={addToCart}
          >
            {added ? "Добавлено ✓" : "Добавить в корзину"}
          </button>

          <div className="product-meta">
            <div>
              <strong>Наличие</strong>
              <span>
                {product.stockStatus || "Уточняется"}
              </span>
            </div>

            {product.skinTypes?.length > 0 && (
              <div>
                <strong>Тип кожи</strong>
                <span>
                  {product.skinTypes.join(", ")}
                </span>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div>
                <strong>Особенности</strong>
                <span>
                  {product.tags.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
