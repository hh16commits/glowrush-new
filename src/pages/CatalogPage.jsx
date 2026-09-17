import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";

const CATEGORY_SLUG_MAP = {
  cleansing: "Очищение",
  toners: "Тонеры",
  essences: "Эссенции",
  ampoules: "Ампулы",
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
  "Ампулы",
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

export default function CatalogPage() {
  const {
    favorites,
    onFavorite,
    onAddToCart: addToCartFromApp,
  } = useOutletContext();
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
              onFavorite={onFavorite}
              onAddToCart={addToCartFromApp}
            />
          ))}
        </section>
      )}
    </main>
  );
}










