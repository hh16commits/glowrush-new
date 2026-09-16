import Icon from "../components/Icon";

const categories = [
  "Все",
  "Очищение",
  "Тонеры",
  "Эссенции",
  "Сыворотки",
  "Кремы",
  "SPF",
  "Маски",
];

function HomePage({
  selectedCategory,
  setSelectedCategory,
  search,
  products,
  productsLoading,
  productsError,
  filteredProducts,
  favorites,
  toggleFavorite,
  addToCart,
  setSelectedProduct,
  scrollToCatalog,
}) {
  const newArrivals = products
    .filter((product) => product.isNew)
    .slice(0, 4);

  const routineSteps = [
    {
      step: "01",
      title: "Очищение",
      text: "Удаляем макияж, SPF и загрязнения.",
    },
    {
      step: "02",
      title: "Тонер",
      text: "Подготавливаем кожу к следующим этапам.",
    },
    {
      step: "03",
      title: "Сыворотка",
      text: "Добавляем активный уход под задачи кожи.",
    },
    {
      step: "04",
      title: "Крем + SPF",
      text: "Закрепляем уход и защищаем кожу днём.",
    },
  ];

  return (
    <>

        <section className="hero hero-premium-v2">
          <div className="hero-v2-content">
            <div className="hero-v2-label">
              <span className="hero-v2-dot"></span>
              K-BEAUTY · GLOWRUSH
            </div>

            <h1>
              Кожа,
              <br />
              которой
              <br />
              хочется <span>сиять.</span>
            </h1>

            <p className="hero-v2-description">
              Корейский уход, подобранный для ежедневной
              рутины и здорового естественного сияния.
            </p>

            <div className="hero-v2-actions">
              <button
                type="button"
                className="hero-v2-primary"
                onClick={scrollToCatalog}
              >
                Смотреть товары
                <span>→</span>
              </button>

              <button
                type="button"
                className="hero-v2-secondary"
                onClick={() =>
                  document.getElementById("categories")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Подобрать уход
              </button>
            </div>

            <div className="hero-v2-meta">
              <div>
                <strong>41+</strong>
                <span>товаров</span>
              </div>

              <div>
                <strong>21</strong>
                <span>бренд</span>
              </div>

              <div>
                <strong>UZ</strong>
                <span>доставка</span>
              </div>
            </div>
          </div>

          <div className="hero-v2-visual">
            <div className="hero-v2-backdrop"></div>

            {products[2]?.image ? (
              <div className="hero-v2-product">
                <div className="hero-v2-product-image-wrap">
                  <img
                    src={products[2].image}
                    alt={products[2].name}
                    className="hero-v2-product-image"
                  />
                </div>

                <div className="hero-v2-product-info">
                  <div>
                    <span>{products[2].brand}</span>
                    <strong>{products[2].name}</strong>
                  </div>

                  <span className="hero-v2-arrow">↗</span>
                </div>
              </div>
            ) : (
              <div className="hero-v2-product hero-v2-placeholder">
                <span>GLOW</span>
                <strong>RUSH</strong>
              </div>
            )}
          </div>
        </section>
        <section className="benefits">

          <div>
            <span>01</span>
            <strong>Оригинальная косметика</strong>
            <p>Только проверенные продукты.</p>
          </div>

          <div>
            <span>02</span>
            <strong>Корейский уход</strong>
            <p>Средства для ежедневной рутины.</p>
          </div>

          <div>
            <span>03</span>
            <strong>Быстрая доставка</strong>
            <p>Доставляем заказы по Узбекистану.</p>
          </div>

          <div>
            <span>04</span>
            <strong>Безопасная покупка</strong>
            <p>Ваши данные защищены.</p>
          </div>

        </section>

        <section className="category-section" id="categories">

          <div className="section-heading">
            <div>
              <p className="eyebrow">SHOP BY CATEGORY</p>
              <h2>Категории</h2>
            </div>
          </div>

          <div className="category-list">

            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  selectedCategory === category
                    ? "category active"
                    : "category"
                }
                onClick={() => {
                  setSelectedCategory(category);
                  scrollToCatalog();
                }}
              >
                {category}
              </button>
            ))}

          </div>

        </section>

        <section className="catalog-section" id="catalog">

          <div className="section-heading">

            <div>
              <p className="eyebrow">GLOWRUSH COLLECTION</p>
              <h2>Популярное</h2>
            </div>

            <span className="product-count">
              {Math.min(filteredProducts.length, 4)} товара
            </span>

          </div>

          {productsLoading ? (
            <div className="empty-state">
              <h3>Загрузка каталога...</h3>
              <p>Получаем товары из Supabase.</p>
            </div>
          ) : productsError ? (
            <div className="empty-state">
              <h3>Не удалось загрузить каталог</h3>
              <p>{productsError}</p>
            </div>
          ) : filteredProducts.length > 0 ? (

            <div className="products-grid">

              {filteredProducts.slice(0, 4).map((product) => {
                const favorite = favorites.includes(product.id);

                return (
                  <article
                    className="product-card"
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                  >

                    <div className="product-image">

                      <img
                        className="product-photo"
                        src={product.image}
                        alt={product.name}
                      />

                      <button
                        type="button"
                        className={
                          favorite
                            ? "favorite active"
                            : "favorite"
                        }
                        aria-label="Добавить в избранное"
                        onClick={(event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleFavorite(product.id);
}}
                      >
                        {favorite ? <Icon name="heart" size={18} strokeWidth={2.2} /> : <Icon name="heart" size={18} /> }
                      </button>

                    </div>

                    <div className="product-info">

                      <p className="product-brand">
                        {product.brand}
                      </p>

                      <h3>{product.name}</h3>

                      <p className="product-category">
                        {product.category}
                      </p>

                      <div className="product-footer">

                        <strong>
                          {product.price.toLocaleString("ru-RU")} сум
                        </strong>

                        <button
                          type="button"
                          className="add-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          <Icon name="plus" size={18} />
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>

          ) : (

            <div className="empty-result">
              <h3>Ничего не нашли</h3>
              <p>
                Попробуйте изменить поиск или категорию.
              </p>
            </div>

          )}

        </section>

        <section className="home-section home-new-arrivals" id="new">
          <div className="section-heading home-section-heading">
            <div>
              <p className="eyebrow">JUST ARRIVED</p>
              <h2>Новинки</h2>
            </div>

            <a className="home-section-link" href="/new">
              Все новинки →
            </a>
          </div>

          {newArrivals.length > 0 ? (
            <div className="products-grid home-products-grid">
              {newArrivals.map((product) => {
                const favorite = favorites.includes(product.id);

                return (
                  <article
                    className="product-card"
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="product-image">
                      <img
                        className="product-photo"
                        src={product.image}
                        alt={product.name}
                      />

                      <span className="home-new-badge">NEW</span>

                      <button
                        type="button"
                        className={favorite ? "favorite active" : "favorite"}
                        aria-label="Добавить в избранное"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                      >
                        {favorite ? (
                          <Icon name="heart" size={18} strokeWidth={2.2} />
                        ) : (
                          <Icon name="heart" size={18} />
                        )}
                      </button>
                    </div>

                    <div className="product-info">
                      <p className="product-brand">{product.brand}</p>
                      <h3>{product.name}</h3>
                      <p className="product-category">{product.category}</p>

                      <div className="product-footer">
                        <strong>
                          {product.price.toLocaleString("ru-RU")} сум
                        </strong>

                        <button
                          type="button"
                          className="add-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          <Icon name="plus" size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Новинки пока не добавлены</h3>
              <p>Добавьте товарам статус «Новинка» в админке.</p>
            </div>
          )}
        </section>

        <section className="home-section home-routine" id="care">
          <div className="section-heading home-section-heading">
            <div>
              <p className="eyebrow">KOREAN ROUTINE</p>
              <h2>Простой уход каждый день</h2>
            </div>

            <a className="home-section-link" href="/care">
              Смотреть уход →
            </a>
          </div>

          <div className="routine-grid">
            {routineSteps.map((item) => (
              <div className="routine-step" key={item.step}>
                <span>{item.step}</span>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      
    </>
  );
}

export default HomePage;



