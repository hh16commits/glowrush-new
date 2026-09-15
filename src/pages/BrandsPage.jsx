import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function pickTranslation(translations = []) {
  return (
    translations.find((item) => item.locale === "RU") ||
    translations[0] ||
    null
  );
}

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadBrands() {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("Brand")
        .select(`
          id,
          slug,
          translations:BrandTranslation (
            locale,
            name
          )
        `)
        .eq("isActive", true)
        .order("slug");

      if (!mounted) return;

      if (queryError) {
        console.error("Brands load error:", queryError);
        setError(queryError.message);
        setBrands([]);
      } else {
        setBrands(
          (data || []).map((brand) => {
            const translation = pickTranslation(
              brand.translations
            );

            return {
              ...brand,
              name:
                translation?.name ||
                brand.slug ||
                "Brand",
            };
          })
        );
      }

      setLoading(false);
    }

    loadBrands();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleBrands = useMemo(() => {
    const query = search.trim().toLowerCase();

    return brands.filter(
      (brand) =>
        !query ||
        brand.name.toLowerCase().includes(query) ||
        brand.slug.toLowerCase().includes(query)
    );
  }, [brands, search]);

  return (
    <main className="brands-page">
      <section className="brands-hero">
        <p className="eyebrow">KOREAN BEAUTY</p>

        <h1>Бренды</h1>

        <p>
          Корейские бренды, которые мы выбираем
          для GlowRush.
        </p>

        <div className="brands-search">
          <span>⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Найти бренд"
          />
        </div>
      </section>

      {loading ? (
        <section className="premium-catalog-state">
          <p>Загружаем бренды…</p>
        </section>
      ) : error ? (
        <section className="premium-catalog-state premium-catalog-error">
          <h2>Не удалось загрузить бренды</h2>
          <p>{error}</p>
        </section>
      ) : visibleBrands.length === 0 ? (
        <section className="premium-catalog-state">
          <h2>Бренд не найден</h2>
        </section>
      ) : (
        <section className="brands-grid">
          {visibleBrands.map((brand) => (
            <Link
              key={brand.id}
              to={`/catalog?brand=${encodeURIComponent(
                brand.slug
              )}`}
              className="brand-tile"
            >
              <span>{brand.name}</span>
              <small>{brand.slug}</small>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
