import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

const homeCategories = [
  { name: "Очищение", subtitle: "CLEANSE", number: "01" },
  { name: "Тонеры", subtitle: "TONE", number: "02" },
  { name: "Эссенции", subtitle: "ESSENCE", number: "03" },
  { name: "Сыворотки", subtitle: "TREAT", number: "04" },
  { name: "Кремы", subtitle: "MOISTURIZE", number: "05" },
  { name: "SPF", subtitle: "PROTECT", number: "06" },
  { name: "Маски", subtitle: "MASKS", number: "07" },
];

const routineSteps = [
  {
    number: "01",
    title: "Очищение",
    text: "Удалите макияж, SPF и загрязнения.",
  },
  {
    number: "02",
    title: "Тонер",
    text: "Подготовьте кожу к активному уходу.",
  },
  {
    number: "03",
    title: "Сыворотка",
    text: "Добавьте средство под задачу кожи.",
  },
  {
    number: "04",
    title: "Крем + SPF",
    text: "Увлажните кожу и защитите её днём.",
  },
];

function HomeProductCard({
  product,
  favorite,
  onFavorite,
  onOpen,
  onAdd,
  isNew = false,
}) {
  return (
    <article
      className="home-v4-product-card"
      onClick={() => onOpen(product)}
    >
      <div className="home-v4-product-media">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="home-v4-image-fallback">
            GLOWRUSH
          </div>
        )}

        {isNew && (
          <span className="home-v4-new-badge">
            NEW
          </span>
        )}

        {product.isBestseller && (
          <span className="home-v4-hit-badge">
            ХИТ
          </span>
        )}

        <button
          type="button"
          className={
            favorite
              ? "home-v4-favorite is-active"
              : "home-v4-favorite"
          }
          aria-label="Добавить в избранное"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onFavorite(product.id);
          }}
        >
          <Icon
            name="heart"
            size={18}
            strokeWidth={favorite ? 2.2 : 1.7}
          />
        </button>
      </div>

      <div className="home-v4-product-info">
        <span className="home-v4-product-brand">
          {product.brand}
        </span>

        <h3>{product.name}</h3>

        <div className="home-v4-product-rating">
          ★ {product.rating || "—"}
          <span>
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="home-v4-product-bottom">
          <strong>
            {product.price.toLocaleString("ru-RU")} сум
          </strong>

          <button
            type="button"
            className="home-v4-add"
            aria-label="Добавить в корзину"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAdd(product);
            }}
          >
            <Icon name="plus" size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function HomePage({
  selectedCategory,
  setSelectedCategory,
  products,
  filteredProducts,
  favorites,
  toggleFavorite,
  addToCart,
  setSelectedProduct,
}) {
  const navigate = useNavigate();
  const popularProducts = filteredProducts.slice(0, 4);

  const newProducts = products
    .filter((product) => product.isNew)
    .slice(0, 4);

  const heroProduct =
    products.find(
      (product) =>
        product.brand?.toLowerCase() ===
        "beauty of joseon"
    ) ||
    products.find((product) => product.isNew) ||
    products[0];

  const brandNames = Array.from(
    new Set(
      products
        .map((product) => product.brand)
        .filter(Boolean)
    )
  ).slice(0, 8);

  const scrollToCategories = () => {
    document.getElementById("home-categories")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <main className="home-v4">
      <section className="home-v4-hero">
        <div className="home-v4-hero-copy">
          <div className="home-v4-eyebrow-line">
            <span></span>
            KOREAN BEAUTY · TASHKENT
          </div>

          <h1>
            Кожа
            <br />
            <em>сияет,</em>
            <br />
            когда всё
            <br />
            на своём месте.
          </h1>

          <p className="home-v4-hero-text">
            Корейский уход, собранный для простой
            ежедневной рутины — от первого очищения
            до SPF.
          </p>

          <div className="home-v4-hero-actions">
            <button
              type="button"
              className="home-v4-primary"
              onClick={() => {
                navigate("/catalog");
              }}
            >
              Смотреть уход
              <span>→</span>
            </button>

            <button
              type="button"
              className="home-v4-secondary"
              onClick={scrollToCategories}
            >
              Подобрать routine
              <span>↗</span>
            </button>
          </div>

          <div className="home-v4-hero-meta">
            <div>
              <strong>{products.length}+</strong>
              <span>товаров</span>
            </div>

            <div>
              <strong>
                {new Set(
                  products
                    .map((product) => product.brand)
                    .filter(Boolean)
                ).size}
              </strong>
              <span>брендов</span>
            </div>

            <div>
              <strong>UZ</strong>
              <span>доставка</span>
            </div>
          </div>
        </div>

        <div className="home-v4-hero-stage">
          <div className="home-v4-stage-topline">
            <span>FEATURED</span>
            <span>01 / 01</span>
          </div>

          <div className="home-v4-stage-orbit home-v4-stage-orbit-one"></div>
          <div className="home-v4-stage-orbit home-v4-stage-orbit-two"></div>

          {heroProduct?.image ? (
            <div className="home-v4-feature-product">
              <div className="home-v4-feature-image">
                <img
                  src={heroProduct.image}
                  alt={heroProduct.name}
                />
              </div>

              <div className="home-v4-feature-caption">
                <div>
                  <span>{heroProduct.brand}</span>
                  <strong>{heroProduct.name}</strong>
                </div>

                <button
                  type="button"
                  aria-label="Открыть товар"
                  onClick={() =>
                    setSelectedProduct(heroProduct)
                  }
                >
                  ↗
                </button>
              </div>
            </div>
          ) : (
            <div className="home-v4-feature-fallback">
              <span>GLOW</span>
              <strong>RUSH</strong>
            </div>
          )}

          <div className="home-v4-stage-note">
            <span>K-BEAUTY EDIT</span>
            <span>DELIVERY IN UZBEKISTAN</span>
          </div>
        </div>
      </section>

      <section className="home-v4-trust">
        <div>
          <strong>ORIGINAL</strong>
          <span>Оригинальная косметика</span>
        </div>

        <div>
          <strong>K-BEAUTY</strong>
          <span>Корейские бренды</span>
        </div>

        <div>
          <strong>DELIVERY</strong>
          <span>Доставка по Узбекистану</span>
        </div>

        <div>
          <strong>CARE</strong>
          <span>Поможем подобрать уход</span>
        </div>
      </section>

      <section
        className="home-v4-section home-v4-categories"
        id="home-categories"
      >
        <div className="home-v4-section-heading">
          <div>
            <span className="home-v4-label">
              SHOP BY STEP
            </span>
            <h2>Соберите свою routine</h2>
          </div>

          <Link to="/catalog">
            Смотреть каталог →
          </Link>
        </div>

        <div className="home-v4-category-grid">
          {homeCategories.map((category, index) => (
            <button
              type="button"
              key={category.number}
              className={
                selectedCategory === category.name
                  ? "home-v4-category is-active"
                  : "home-v4-category"
              }
              onClick={() => {
                setSelectedCategory(category.name);
                const categorySlugMap = {
                  Очищение: "cleansing",
                  Тонеры: "toners",
                  Эссенции: "essences",
                  Сыворотки: "serums",
                  Кремы: "creams",
                  SPF: "spf",
                  Маски: "masks",
                };
                const categorySlug = categorySlugMap[category.name];
                navigate(categorySlug
                  ? `/catalog?category=${categorySlug}`
                  : "/catalog");
              }}
            >
              <div className="home-v4-category-top">
                <span>{category.subtitle}</span>
                <strong>{category.number}</strong>
              </div>

              <div className="home-v4-category-bottom">
                <span>{category.name}</span>
                <i>↗</i>
              </div>

              <div
                className="home-v4-category-index"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section
        className="home-v4-section home-v4-products"
        id="catalog"
      >
        <div className="home-v4-section-heading">
          <div>
            <span className="home-v4-label">
              EDITOR'S PICKS
            </span>
            <h2>Популярное</h2>
          </div>

          <Link to="/catalog">
            Смотреть всё →
          </Link>
        </div>

        <div className="home-v4-products-grid">
          {popularProducts.map((product) => (
            <HomeProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(product.id)}
              onFavorite={toggleFavorite}
              onOpen={setSelectedProduct}
              onAdd={addToCart}
            />
          ))}
        </div>
      </section>

      {newProducts.length > 0 && (
        <section
          className="home-v4-section home-v4-products home-v4-new"
          id="new"
        >
          <div className="home-v4-section-heading">
            <div>
              <span className="home-v4-label">
                JUST ARRIVED
              </span>
              <h2>Новинки</h2>
            </div>

            <Link to="/new">
              Все новинки →
            </Link>
          </div>

          <div className="home-v4-products-grid">
            {newProducts.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                favorite={favorites.includes(product.id)}
                onFavorite={toggleFavorite}
                onOpen={setSelectedProduct}
                onAdd={addToCart}
                isNew
              />
            ))}
          </div>
        </section>
      )}

      <section
        className="home-v4-routine"
        id="care"
      >
        <div className="home-v4-routine-intro">
          <span className="home-v4-label">
            THE K-BEAUTY METHOD
          </span>

          <h2>
            Меньше
            <br />
            хаоса.
            <br />
            Больше
            <br />
            <em>сияния.</em>
          </h2>

          <p>
            Уход не должен быть сложным.
            Четыре понятных шага — и кожа
            получает именно то, что ей нужно.
          </p>

          <Link
            to="/care"
            className="home-v4-primary"
          >
            Смотреть уход
            <span>→</span>
          </Link>
        </div>

        <div className="home-v4-routine-steps">
          {routineSteps.map((step) => (
            <div
              className="home-v4-routine-step"
              key={step.number}
            >
              <span>{step.number}</span>

              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>

              <i>↗</i>
            </div>
          ))}
        </div>
      </section>

      <section className="home-v4-section home-v4-brands">
        <div className="home-v4-section-heading">
          <div>
            <span className="home-v4-label">
              CURATED BRANDS
            </span>
            <h2>Корея, которой мы доверяем</h2>
          </div>

          <Link to="/brands">
            Все бренды →
          </Link>
        </div>

        <div className="home-v4-brand-list">
          {brandNames.map((brand, index) => (
            <div
              className="home-v4-brand"
              key={brand}
            >
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{brand}</strong>
              <i>↗</i>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomePage;


