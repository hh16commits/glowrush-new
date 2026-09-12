import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";
import AuthModal from "./AuthModal";
import "./styles/glowrush.css";

const categories = [
  "Все",
  "Очищение",
  "Тонеры",
  "Эссенции",
  "Сыворотки",
  "Кремы",
  "SPF",
  "Маски",
]

function Icon({ name, size = 20, strokeWidth = 1.8, className = "" }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  switch (name) {
    case "cart":
      return (
        <svg {...common}>
          <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
          <circle cx="10" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
      );

    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "minus":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );

    default:
      return null;
  }
}
function App() {
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError("");

      const { data, error } = await supabase
        .from("Product")
        .select(`
          id,
          sku,
          slug,
          price,
          oldPrice,
          stockStatus,
          isActive,
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

      if (error) {
        console.error("Supabase products error:", error);
        setProductsError(error.message);
        setProducts([]);
        setProductsLoading(false);
        return;
      }

      const mappedProducts = (data || []).map((product) => {
        const brandTranslation =
          product.brand?.translations?.find(
            (translation) => translation.locale === "RU"
          ) || product.brand?.translations?.[0];

        const categoryTranslation =
          product.category?.translations?.find(
            (translation) => translation.locale === "RU"
          ) || product.category?.translations?.[0];

        const productTranslation =
          product.translations?.find(
            (translation) => translation.locale === "RU"
          ) || product.translations?.[0];

        const primaryImage =
          product.images?.find((image) => image.isPrimary) ||
          [...(product.images || [])].sort(
            (a, b) => a.position - b.position
          )[0];

        return {
          id: product.id,
          sku: product.sku,
          slug: product.slug,
          brand: brandTranslation?.name || product.brand?.slug || "",
          name: productTranslation?.name || product.slug,
          category:
            categoryTranslation?.name ||
            product.category?.slug ||
            "",
          price: product.price,
          oldPrice: product.oldPrice,
          image: primaryImage?.url || "",
          description:
            productTranslation?.description ||
            "Средство для ежедневного ухода за кожей.",
          stockStatus: product.stockStatus,
        };
      });

      setProducts(mappedProducts);
      setProductsLoading(false);
    };

    loadProducts();
  }, []);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState("form");
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    city: "Ташкент",
    comment: "",
  });
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("glowrush-orders")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("glowrush-orders", JSON.stringify(orders));
  }, [orders]);

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(
    () => sessionStorage.getItem("glowrush-admin") === "true"
  );

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "Все" ||
      product.category === selectedCategory;

    const query = search.toLowerCase().trim();

    const searchMatch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    return categoryMatch && searchMatch;
  });

  const cartCount = cart.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const cityOptions = [
  "Ташкент",
  "Самарканд",
  "Бухара",
  "Андижан",
  "Наманган",
];
const deliveryOptions = [
    {
      id: "courier",
      name: "Курьер",
      description: "Доставка до двери по городу",
      price: cartTotal >= 300000 ? 0 : 20000,
    },
    {
      id: "pickup",
      name: "Самовывоз",
      description: "Из шоурума GlowRush",
      price: 0,
    },
  ];

  const [selectedDelivery, setSelectedDelivery] = useState(
    deliveryOptions[0]
  );

  const deliveryFee = selectedDelivery.price;
  const orderTotal = cartTotal + deliveryFee;

  const openCheckout = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setCheckoutStatus("form");
    setCheckoutOpen(true);
  };

  const confirmCheckout = async (event) => {
    event.preventDefault();

    if (!cart.length) {
      alert("Корзина пуста.");
      return;
    }

    const orderId = crypto.randomUUID();
    const orderNumber = `GR-${new Date().getTime().toString().slice(-8)}`;
    const now = new Date().toISOString();

    const order = {
      id: orderId,
      number: orderNumber,
      createdAt: new Date().toISOString(),
      items: cart,
      subtotal: cartTotal,
      deliveryFee,
      total: orderTotal,
      customer: checkoutForm,
      delivery: selectedDelivery,
    };

    try {
      const { error: orderError } = await supabase
        .from("Order")
        .insert({
          id: orderId,
          orderNumber,
          userId: user.id,
          guestName: checkoutForm.name.trim(),
          guestPhone: checkoutForm.phone.trim(),
          status: "PENDING",
          currency: "UZS",
          subtotal: cartTotal,
          discountAmount: 0,
          deliveryFee,
          giftWrapFee: 0,
          totalAmount: orderTotal,
          localeAtOrder: "RU",
          createdAt: now,
          updatedAt: now,
          notes: [
            checkoutForm.city?.trim(),
            checkoutForm.comment?.trim(),
          ]
            .filter(Boolean)
            .join(" — ") || null,
        });

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        id: crypto.randomUUID(),
        orderId,
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("OrderItem")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const { error: deliveryError } = await supabase
        .from("Delivery")
        .insert({
          id: crypto.randomUUID(),
          orderId,
          provider: "MANUAL",
          status: "READY_FOR_DELIVERY",
          fee: deliveryFee,
          createdAt: now,
          updatedAt: now,
        });

      if (deliveryError) throw deliveryError;

      const { error: historyError } = await supabase
        .from("OrderStatusHistory")
        .insert({
          id: crypto.randomUUID(),
          orderId,
          fromStatus: null,
          toStatus: "PENDING",
          note: "Новый заказ создан в магазине",
        });

      if (historyError) throw historyError;

      setOrders((current) => [order, ...current]);
      setConfirmedOrder(order);
      setCheckoutStatus("success");
      setCart([]);
    } catch (error) {
      console.error("Supabase order creation error:", error);
      alert(
        `Не удалось оформить заказ.\n\n${error.message || "Неизвестная ошибка"}`
      );
    }
  };
  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setCartOpen(true);
  };

  const decreaseQuantity = (id) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const increaseQuantity = (id) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const scrollToCatalog = () => {
    document.getElementById("catalog")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="glowrush">

      <header className="site-header">
        <div className="header-inner">

          <button
            type="button"
            className="brand-logo"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Glow<span>Rush</span>
          </button>

          <nav className="main-nav">
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Главная
            </a>

            <a
              href="#catalog"
              onClick={(event) => {
                event.preventDefault();
                scrollToCatalog();
              }}
            >
              Каталог
            </a>

            <a href="#new">Новинки</a>
            <a href="#care">Уход</a>
          </nav>

          <div className="header-actions">

            {searchOpen && (
              <div className="search-field">
                <input
                  autoFocus
                  type="search"
                  placeholder="Поиск косметики..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <button
                  type="button"
                  aria-label="Закрыть поиск"
                  onClick={() => {
                    setSearch("");
                    setSearchOpen(false);
                  }}
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            )}

            <button
              type="button"
              className="icon-button"
              aria-label="Поиск"
              onClick={() => setSearchOpen((value) => !value)}
            >
              ⌕
            </button>

            <button
              type="button"
              className="icon-button favorites-button"
              aria-label="Избранное"
              onClick={() => setFavoritesOpen(true)}
            >
              <Icon name="heart" size={20} />

              {favorites.length > 0 && (
                <span className="favorites-count">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              className="cart-button"
              aria-label="Корзина"
              onClick={() => setCartOpen(true)}
            >
              <Icon name="cart" size={20} />

              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </button>

          </div>
        </div>
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
      <main>

        <section className="hero">
          <div className="hero-content">

            <p className="eyebrow">KOREAN BEAUTY</p>

            <h1>
              Твоя кожа.
              <br />
              Твоё <span>сияние.</span>
            </h1>

            <p className="hero-description">
              Корейская косметика для ежедневного ухода,
              здоровой кожи и естественного сияния.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={scrollToCatalog}
            >
              Смотреть каталог
            </button>

          </div>

          <div className="hero-visual">
            <div className="hero-orb">
              <span>GLOW</span>
              <strong>RUSH</strong>
            </div>
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

        <section className="category-section">

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
              {filteredProducts.length} товара
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

              {filteredProducts.map((product) => {
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

        <section className="simple-section" id="new">
          <p className="eyebrow">JUST ARRIVED</p>
          <h2>Новинки</h2>
          <p>
            Скоро здесь появятся новые продукты GlowRush.
          </p>
        </section>

        <section className="simple-section" id="care">
          <p className="eyebrow">DAILY SKINCARE</p>
          <h2>Уход</h2>
          <p>
            Подборка средств для ежедневного ухода.
          </p>
        </section>

      </main>

      <footer className="site-footer">

        <div className="footer-logo">
          Glow<span>Rush</span>
        </div>

        <p>
          © 2026 GlowRush. Корейская косметика.
        </p>

              <button
          type="button"
          className="admin-access"
          onClick={() => setAdminOpen(true)}
        >
          Админ
        </button>
</footer>


      {selectedProduct && (
        <div
          className="product-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              type="button"
              className="product-modal-close"
              aria-label="Закрыть"
              onClick={() => setSelectedProduct(null)}
            >
              <Icon name="close" size={20} />
            </button>

            <div className="product-modal-image">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />

              <button
                type="button"
                className={
                  favorites.includes(selectedProduct.id)
                    ? "product-modal-favorite active"
                    : "product-modal-favorite"
                }
                onClick={() =>
                  toggleFavorite(selectedProduct.id)
                }
              >
                {favorites.includes(selectedProduct.id) ? <Icon name="heart" size={20} strokeWidth={2.2} /> : <Icon name="heart" size={20} /> }
              </button>
            </div>

            <div className="product-modal-info">

              <p className="product-brand">
                {selectedProduct.brand}
              </p>

              <h2>{selectedProduct.name}</h2>

              <p className="product-modal-category">
                {selectedProduct.category}
              </p>

              <div className="product-modal-price">
                {selectedProduct.price.toLocaleString("ru-RU")} сум
              </div>

              <p className="product-modal-description">
                Средство для ежедневного ухода за кожей.
                Подходит для создания комфортной и эффективной
                корейской skincare-рутины.
              </p>

              <div className="product-modal-actions">

                <button
                  type="button"
                  className="product-modal-cart"
                  onClick={() => {
                    addToCart(selectedProduct);
                  }}
                >
                  Добавить в корзину
                </button>

                <button
                  type="button"
                  className="product-modal-continue"
                  onClick={() => setSelectedProduct(null)}
                >
                  Продолжить покупки
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >

          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="cart-header">
              <div>
                <p className="eyebrow">YOUR BAG</p>
                <h2>Корзина</h2>
              </div>

              <button
                type="button"
                className="cart-close"
                aria-label="Закрыть корзину"
                onClick={() => setCartOpen(false)}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {cart.length === 0 ? (

              <div className="cart-empty">
                <div className="cart-empty-icon">
                  <Icon name="cart" size={42} strokeWidth={1.5} />
                </div>
                <h3>Корзина пока пуста</h3>
                <p>
                  Добавьте понравившиеся товары,
                  и они появятся здесь.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    scrollToCatalog();
                  }}
                >
                  Перейти в каталог
                </button>
              </div>

            ) : (

              <>
                <div className="cart-items">

                  {cart.map((item) => (

                    <div className="cart-item" key={item.id}>

                      <div className="cart-item-image">
                        <span>{item.brand}</span>
                      </div>

                      <div className="cart-item-info">

                        <p className="product-brand">
                          {item.brand}
                        </p>

                        <h3>{item.name}</h3>

                        <strong>
                          {item.price.toLocaleString("ru-RU")} сум
                        </strong>

                        <div className="quantity-control">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                          >
                            <Icon name="minus" size={16} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                          >
                            <Icon name="plus" size={16} />
                          </button>

                        </div>

                      </div>

                      <button
                        type="button"
                        className="remove-cart-item"
                        aria-label="Удалить товар"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                      >
                        <Icon name="close" size={16} />
                      </button>

                    </div>

                  ))}

                </div>

                <div className="cart-footer">

                  <div className="cart-total">
                    <span>Итого</span>
                    <strong>
                      {cartTotal.toLocaleString("ru-RU")} сум
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="primary-button checkout-button" onClick={openCheckout}
                  >
                    Оформить заказ
                  </button>

                </div>

              </>

            )}

          </aside>

        </div>
      )}

      
      {favoritesOpen && (
        <div
          className="favorites-overlay"
          onClick={() => setFavoritesOpen(false)}
        >
          <aside
            className="favorites-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="favorites-header">
              <div>
                <p className="eyebrow">YOUR FAVORITES</p>
                <h2>Избранное</h2>
              </div>

              <button
                type="button"
                className="favorites-close"
                aria-label="Закрыть избранное"
                onClick={() => setFavoritesOpen(false)}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {favorites.length === 0 ? (
              <div className="favorites-empty">
                <div className="favorites-empty-icon">
                  <Icon name="heart" size={42} strokeWidth={1.5} />
                </div>

                <h3>Избранное пока пусто</h3>

                <p>
                  Нажимайте ♡ на товарах, которые хотите сохранить.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setFavoritesOpen(false)
                    scrollToCatalog()
                  }}
                >
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <div className="favorites-items">
                {products
                  .filter((product) => favorites.includes(product.id))
                  .map((product) => (
                    <div className="favorite-item" key={product.id}>

                      <div className="favorite-item-image">
                        <span>{product.brand}</span>
                      </div>

                      <div className="favorite-item-info">
                        <p className="product-brand">
                          {product.brand}
                        </p>

                        <h3>{product.name}</h3>

                        <strong>
                          {product.price.toLocaleString("ru-RU")} сум
                        </strong>

                        <button
                          type="button"
                          className="favorite-add-cart"
                          onClick={(event) => {
                            event.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          Добавить в корзину
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-favorite"
                        aria-label="Удалить из избранного"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                      >
                        <Icon name="heart" size={18} strokeWidth={2.2} />
                      </button>

                    </div>
                  ))}
              </div>
            )}

          </aside>
        </div>
      )}
  {adminOpen && (
    <div className="admin-screen">
      <button
        type="button"
        className="admin-back"
        onClick={() => setAdminOpen(false)}
      >
        ← Вернуться в магазин
      </button>

      {adminLoggedIn ? (
        <AdminPanel
          orders={orders}
          onLogout={() => {
            sessionStorage.removeItem("glowrush-admin");
            setAdminLoggedIn(false);
          }}
        />
      ) : (
        <AdminLogin
          onLogin={() => setAdminLoggedIn(true)}
        />
      )}
    </div>
  )}
  {checkoutOpen && (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <button
          type="button"
          className="checkout-close"
          onClick={() => setCheckoutOpen(false)}
        >
          <Icon name="close" size={20} />
        </button>

        {checkoutStatus === "form" ? (
          <>
            <p className="eyebrow">GLOWRUSH CHECKOUT</p>
            <h2>Оформление заказа</h2>

            <form onSubmit={confirmCheckout} className="checkout-form">
              <label>
                Имя
                <input
                  type="text"
                  required
                  value={checkoutForm.name}
                  onChange={(event) =>
                    setCheckoutForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ваше имя"
                />
              </label>

              <label>
                Телефон
                <input
                  type="tel"
                  required
                  value={checkoutForm.phone}
                  onChange={(event) =>
                    setCheckoutForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+998 90 123 45 67"
                />
              </label>

              <label>
                Город
                <select
                  value={checkoutForm.city}
                  onChange={(event) =>
                    setCheckoutForm((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                >
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <div className="checkout-delivery">
                <span>Способ получения</span>

                <div className="checkout-delivery-options">
                  {deliveryOptions.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      className={`checkout-delivery-option ${
                        selectedDelivery.id === option.id
                          ? "checkout-delivery-option-active"
                          : ""
                      }`}
                      onClick={() => setSelectedDelivery(option)}
                    >
                      <strong>{option.name}</strong>
                      <small>{option.description}</small>
                      <b>
                        {option.price === 0
                          ? "Бесплатно"
                          : `${option.price.toLocaleString("ru-RU")} сум`}
                      </b>
                    </button>
                  ))}
                </div>
              </div>

              <label>
                Комментарий
                <textarea
                  value={checkoutForm.comment}
                  onChange={(event) =>
                    setCheckoutForm((current) => ({
                      ...current,
                      comment: event.target.value,
                    }))
                  }
                  placeholder="Комментарий к заказу"
                  rows="3"
                />
              </label>

              <div className="checkout-summary">
                <div>
                  <span>Товары</span>
                  <strong>
                    {cartTotal.toLocaleString("ru-RU")} сум
                  </strong>
                </div>

                <div>
                  <span>Доставка</span>
                  <strong>
                    {deliveryFee === 0
                      ? "Бесплатно"
                      : `${deliveryFee.toLocaleString("ru-RU")} сум`}
                  </strong>
                </div>

                <div className="checkout-summary-total">
                  <span>Итого</span>
                  <strong>
                    {orderTotal.toLocaleString("ru-RU")} сум
                  </strong>
                </div>
              </div>

              <button type="submit" className="primary-button">
                Подтвердить заказ
              </button>
            </form>
          </>
        ) : (
          <div className="checkout-success">
            <div className="checkout-success-icon">
              <Icon name="check" size={42} strokeWidth={1.8} />
            </div>

            <p className="eyebrow">ЗАКАЗ ПРИНЯТ</p>

            <h2>Спасибо за заказ!</h2>

            <p>
              Ваш заказ{" "}
              <strong>{confirmedOrder?.number}</strong>{" "}
              успешно оформлен.
            </p>

            <p>
              Мы свяжемся с вами по указанному номеру телефона.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setCheckoutOpen(false);
                setConfirmedOrder(null);
              }}
            >
              Вернуться в магазин
            </button>
          </div>
        )}
      </div>
    </div>
  )}
    </div>
  );
}

export default App;



































