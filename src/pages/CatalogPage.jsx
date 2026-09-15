import { useEffect, useMemo, useState } from "react";
import { Link , useSearchParams} from "react-router-dom";
import { supabase } from "../lib/supabase";
import Icon from "../components/Icon";

const CATEGORY_SLUG_MAP = {
  cleansing: "Очищение",
  toners: "Тонеры",
  essences: "Эссенции",
  serums: "Сыворотки",
  creams: "Кремы",
  spf: "SPF",
  masks: "Маски",
};
    const CATEGORIES = [
  "Все",
  "Очищение",
  "Тонеры",
  "Эссенции",
  "Сыворотки",
  "Кремы",
  "SPF",
  "Маски",
];

const formatPrice = (value) =>
  new Intl.NumberFormat("ru-RU").format(
    Number(value || 0)
  );

const pickTranslation = (translations = []) =>
  translations.find((item) => item.locale === "RU") ||
  translations[0] ||
  null;

function ProductCard({
  product,
  favorite,
  onFavorite,
  onAddToCart,
}) {
  const discount =
    product.oldPrice > product.price
      ? Math.round(
          (1 - product.price / product.oldPrice) * 100
        )
      : 0;

  return (
    <article className="premium-product-card">
      <div className="premium-product-media">
        <Link
          to={`/product/${product.slug}`}
          className="premium-product-image"
        >
          {product.image ? (
            <>
              <img
                className="product-image-main"
                src={product.image}
                alt={product.name}
                loading="lazy"
              />

              {product.secondImage && (
                <img
                  className="product-image-hover"
                  src={product.secondImage}
                  alt=""
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="premium-placeholder">
              <span>GLOW</span>
              <small>RUSH</small>
            </div>
          )}
        </Link>

        <div className="product-badge-stack">
          {product.isBestseller && (
            <span className="product-badge badge-hit">
              ХИТ
            </span>
          )}

          {product.isNew && (
            <span className="product-badge badge-new">
              NEW
            </span>
          )}

          {discount > 0 && (
            <span className="product-badge badge-sale">
              −{discount}%
            </span>
          )}

          {product.stockStatus === "LOW_STOCK" && (
            <span className="product-badge badge-low">
              Заканчивается
            </span>
          )}
        </div>

        <button
          type="button"
          className={`product-favorite-button ${
            favorite ? "is-active" : ""
          }`}
          onClick={() => onFavorite(product.id)}
          aria-label={
            favorite
              ? "Убрать из избранного"
              : "Добавить в избранное"
          }
        >
          <Icon name="heart" size={19} />
        </button>

        <button
          type="button"
          className="product-quick-add"
          onClick={() => onAddToCart(product)}
        >
          В корзину
        </button>
      </div>

      <div className="premium-product-copy">
        <p className="premium-product-brand">
          {product.brand}
        </p>

        <Link
          to={`/product/${product.slug}`}
          className="premium-product-name"
        >
          {product.name}
        </Link>

        <p className="premium-product-benefit">
          {product.description}
        </p>

        <div className="premium-product-meta">
          <div className="product-rating-line">
            ★ {product.rating || "—"}
            <span>
              ({product.reviewCount || 0})
            </span>
          </div>

          <div className="premium-product-prices">
            <strong>
              {formatPrice(product.price)} сум
            </strong>

            {product.oldPrice > product.price && (
              <span>
                {formatPrice(product.oldPrice)} сум
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const brandFromUrl = (searchParams.get("brand") || "").toLowerCase();
    const categoryFromUrl = (searchParams.get("category") || "").toLowerCase();
const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("Все");
  const [brand, setBrand] = useState("Все бренды");
  const [availability, setAvailability] = useState("Все");
  const [discountOnly, setDiscountOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [favorites, setFavorites] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("glowrush-favorites")
        ) || []
      );
    } catch {
      return [];
    }
  });

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
        console.error(
          "Catalog load error:",
          queryError
        );
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

        const secondImage = images.find(
          (image) =>
            image.url !== primaryImage?.url
        );

        return {
          ...product,
          brand:
            brandTranslation?.name ||
            product.brand?.slug ||
            "",
          brandSlug: String(product.brand?.slug || "").toLowerCase(),
          category:
            categoryTranslation?.name ||
            product.category?.slug ||
            "",
          categorySlug: String(product.category?.slug || "").toLowerCase(),
          name:
            productTranslation?.name ||
            product.slug,
          description:
            productTranslation?.description ||
            "Средство для ежедневного ухода за кожей.",
          image: primaryImage?.url || "",
          secondImage: secondImage?.url || "",
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

  // Синхронизация URL-фильтров с UI
  useEffect(() => {
    if (brandFromUrl) {
      const matchedBrand = products.find(
        (product) => product.brandSlug === brandFromUrl
      );

      if (matchedBrand?.brand) {
        setBrand(matchedBrand.brand);
      }
    } else {
      setBrand("Все бренды");
    }

    if (categoryFromUrl) {
      const matchedCategory =
        CATEGORY_SLUG_MAP[categoryFromUrl];

      if (matchedCategory) {
        setCategory(matchedCategory);
      }
    } else {
      setCategory("Все");
    }
  }, [
    brandFromUrl,
    categoryFromUrl,
    products,
  ]);
  const brands = useMemo(
    () => [
      "Все бренды",
      ...Array.from(
        new Set(
          products
            .map((product) => product.brand)
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "ru")),
    ],
    [products]
  );

  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];

      localStorage.setItem(
        "glowrush-favorites",
        JSON.stringify(next)
      );

      return next;
    });
  };

  const addToCart = (product) => {
    let current = [];

    try {
      current =
        JSON.parse(
          localStorage.getItem("glowrush-cart")
        ) || [];
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
      image: product.image,
      description: product.description,
      stockStatus: product.stockStatus,
    };

    const next = existing
      ? current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) + 1,
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
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const categoryMatch =
        (category === "Все" ||
          product.category === category) &&
        (!categoryFromUrl ||
          product.categorySlug === categoryFromUrl);

      const brandMatch =
        (brand === "Все бренды" ||
          product.brand === brand) &&
        (!brandFromUrl ||
          product.brandSlug === brandFromUrl);

      const availabilityMatch =
        availability === "Все" ||
        (availability === "В наличии" &&
          product.stockStatus !== "OUT_OF_STOCK") ||
        (availability === "Заканчивается" &&
          product.stockStatus === "LOW_STOCK");

      const discountMatch =
        !discountOnly ||
        product.oldPrice > product.price;

      const searchMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return (
        categoryMatch &&
        brandMatch &&
        availabilityMatch &&
        discountMatch &&
        searchMatch
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "price-asc") {
        return a.price - b.price;
      }

      if (sort === "price-desc") {
        return b.price - a.price;
      }

      if (sort === "rating") {
        return (
          (b.rating || 0) -
          (a.rating || 0)
        );
      }

      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [
    products,
    category,
    brand,
    brandFromUrl,
    categoryFromUrl,
    availability,
    discountOnly,
    search,
    sort,
  ]);

  return (
    <main className="premium-catalog-page">
      <section className="premium-catalog-hero">
        <div>
          <p className="eyebrow">
            GLOWRUSH COLLECTION
          </p>

          <h1>
            Уход, который
            <br />
            подходит тебе.
          </h1>

          <p className="premium-catalog-intro">
            Корейская косметика с понятным выбором:
            от очищения до SPF.
          </p>
        </div>

        <div className="catalog-hero-note">
          <span>{filteredProducts.length}</span>
          <small>товаров</small>
        </div>
      </section>

      <section className="premium-catalog-controls">
        <div className="catalog-search-large">
          <span>⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Поиск по названию, бренду или категории"
          />
        </div>

        <div className="catalog-sort">
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
            aria-label="Сортировка"
          >
            <option value="newest">
              Сначала новые
            </option>
            <option value="rating">
              По рейтингу
            </option>
            <option value="price-asc">
              Сначала дешевле
            </option>
            <option value="price-desc">
              Сначала дороже
            </option>
          </select>
        </div>
      </section>

      <section className="premium-catalog-categories">
        {CATEGORIES.map((item) => (
          <button
            type="button"
            key={item}
            className={
              category === item ? "is-active" : ""
            }
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </section>

      <section className="premium-filter-row">
        <select
          value={brand}
          onChange={(event) =>
            setBrand(event.target.value)
          }
          aria-label="Бренд"
        >
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={availability}
          onChange={(event) =>
            setAvailability(event.target.value)
          }
          aria-label="Наличие"
        >
          <option value="Все">Наличие</option>
          <option value="В наличии">
            В наличии
          </option>
          <option value="Заканчивается">
            Заканчивается
          </option>
        </select>

        <button
          type="button"
          className={
            discountOnly
              ? "filter-pill is-active"
              : "filter-pill"
          }
          onClick={() =>
            setDiscountOnly((value) => !value)
          }
        >
          Только со скидкой
        </button>

        {(category !== "Все" ||
          brand !== "Все бренды" ||
          availability !== "Все" ||
          discountOnly ||
          search) && (
          <button
            type="button"
            className="filter-reset"
            onClick={() => {
              setCategory("Все");
              setBrand("Все бренды");
              setAvailability("Все");
              setDiscountOnly(false);
              setSearch("");
            }}
          >
            Сбросить
          </button>
        )}
      </section>

      {loading ? (
        <section className="premium-catalog-state">
          <p>Загружаем GlowRush…</p>
        </section>
      ) : error ? (
        <section className="premium-catalog-state premium-catalog-error">
          <h2>Не удалось загрузить каталог</h2>
          <p>{error}</p>
        </section>
      ) : filteredProducts.length === 0 ? (
        <section className="premium-catalog-state">
          <h2>Ничего не найдено</h2>
          <p>
            Попробуй изменить фильтры или поиск.
          </p>
        </section>
      ) : (
        <section className="premium-product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(product.id)}
              onFavorite={toggleFavorite}
              onAddToCart={addToCart}
            />
          ))}
        </section>
      )}
    </main>
  );
}






