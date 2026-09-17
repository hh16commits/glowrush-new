import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import {
  CART_UPDATED_EVENT,
  FAVORITES_UPDATED_EVENT,
  addProductToCart,
  getCart,
  getFavorites,
  removeProductFromCart,
  setCart,
  setFavorites,
  updateCartQuantity,
  toggleProductFavorite,
} from "./lib/shop";
import AdminPanel from "./admin/AdminPanel";
import AuthModal from "./AuthModal";
import CartDrawer from "./components/CartDrawer";
import FavoritesDrawer from "./components/FavoritesDrawer";
import ProfilePanel from "./components/ProfilePanel";
import Icon from "./components/Icon";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import "./styles/glowrush.css";

function App() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCartState] = useState(() => getCart());
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavoritesState] = useState(() => getFavorites());
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
          rating,
          reviewCount,
          isBestseller,
          stockStatus,
          isActive,
          isNew,
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
          rating: product.rating,
          reviewCount: product.reviewCount,
          isBestseller: product.isBestseller,
          image: primaryImage?.url || "",
          description:
            productTranslation?.description ||
            "Средство для ежедневного ухода за кожей.",
          stockStatus: product.stockStatus,
          isNew: product.isNew,
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRoleLoading, setAdminRoleLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminRole = async () => {
      if (!user) {
        if (mounted) {
          setIsAdmin(false);
          setAdminRoleLoading(false);
        }
        return;
      }

      setAdminRoleLoading(true);

      const { data, error } = await supabase
        .from("User")
        .select("role,status")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Admin role check error:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(
          data?.status === "ACTIVE" &&
            (data?.role === "OWNER" || data?.role === "ADMIN")
        );
      }

      setAdminRoleLoading(false);
    };

    checkAdminRole();

    return () => {
      mounted = false;
    };
  }, [user]);

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

    setCartOpen(false);
    setCheckoutStatus("form");
    setCheckoutOpen(true);
  };

  const confirmCheckout = async (event) => {
    event.preventDefault();

    if (!cart.length) {
      alert("Корзина пуста.");
      return;
    }

    if (!user) {
      alert("������� ������� � �������.");
      setAuthOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("create_order", {
        p_items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        p_name: checkoutForm.name.trim(),
        p_phone: checkoutForm.phone.trim(),
        p_city: checkoutForm.city.trim(),
        p_comment: checkoutForm.comment.trim() || null,
        p_delivery_method: selectedDelivery.id,
      });

      if (error) throw error;

      const order = {
        id: data.orderId,
        number: data.orderNumber,
        createdAt: new Date().toISOString(),
        items: cart,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        total: data.total,
        customer: checkoutForm,
        delivery: {
          ...selectedDelivery,
          price: data.deliveryFee,
        },
      };

      setOrders((current) => [order, ...current]);
      setConfirmedOrder(order);
      setCheckoutStatus("success");
      commitCart([]);
    } catch (error) {
      console.error("Supabase order creation error:", error);

      const message =
        typeof error?.message === "string" && error.message.trim()
          ? error.message.trim()
          : "Не удалось оформить заказ.";

      const isInventoryError =
        message.includes("Недостаточно товара на складе") ||
        message.includes("Товар недоступен") ||
        message.includes("Товар не найден");

      if (isInventoryError) {
        alert(
          "К сожалению, один из товаров в корзине сейчас недоступен или его количества недостаточно на складе. Корзина сохранена."
        );
      } else {
        alert(`Не удалось оформить заказ.\n\n${message}`);
      }
    }
  };
  useEffect(() => {
    const handleCartUpdated = () => {
      setCartState(getCart());
    };

    const handleFavoritesUpdated = () => {
      setFavoritesState(getFavorites());
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    window.addEventListener(
      FAVORITES_UPDATED_EVENT,
      handleFavoritesUpdated
    );

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
      window.removeEventListener(
        FAVORITES_UPDATED_EVENT,
        handleFavoritesUpdated
      );
    };
  }, []);
  const commitCart = (nextCart) => {
    setCartState(nextCart);
    setCart(nextCart);
  };

  const addToCart = (product) => {
    if (!product || product.stockStatus === "OUT_OF_STOCK") {
      return;
    }

    commitCart(addProductToCart(product));
    setCartOpen(true);
  };

  const decreaseQuantity = (id) => {
    const item = getCart().find((cartItem) => cartItem.id === id);

    if (!item) return;

    commitCart(
      updateCartQuantity(
        id,
        Number(item.quantity || 0) - 1
      )
    );
  };

  const increaseQuantity = (id) => {
    const item = getCart().find((cartItem) => cartItem.id === id);

    if (!item || item.stockStatus === "OUT_OF_STOCK") {
      return;
    }

    commitCart(
      updateCartQuantity(
        id,
        Number(item.quantity || 0) + 1
      )
    );
  };

  const removeFromCart = (id) => {
    commitCart(removeProductFromCart(id));
  };

  const toggleFavorite = (id) => {
    const next = toggleProductFavorite(id);

    setFavoritesState(next);
    setFavorites(next);
  };
  const scrollToCatalog = () => {
    document.getElementById("catalog")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="glowrush">
      <Header
        user={user}
        isAdmin={isAdmin}
        onAdminOpen={() => setAdminOpen(true)}
        onProfileOpen={() => setProfileOpen(true)}
        onAuthOpen={() => setAuthOpen(true)}
        searchOpen={searchOpen}
        search={search}
        onSearchChange={(value) => setSearch(value)}
        onSearchClose={() => {
          setSearch("");
          setSearchOpen(false);
        }}
        onSearchToggle={() => setSearchOpen((value) => !value)}
        favorites={favorites}
        cartCount={cartCount}
        onFavoritesOpen={() => setFavoritesOpen(true)}
        onCartOpen={() => setCartOpen(true)}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
      {location.pathname === "/" ? (
        <HomePage
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          search={search}
          products={products}
          productsLoading={productsLoading}
          productsError={productsError}
          filteredProducts={filteredProducts}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          addToCart={addToCart}
          setSelectedProduct={setSelectedProduct}
          scrollToCatalog={scrollToCatalog}
        />
      ) : (
        <Outlet
  context={{
    user,
    favorites,
    cartCount,
    onFavorite: toggleFavorite,
    onAddToCart: addToCart,
    setFavoritesOpen,
    setCartOpen,
    setAuthOpen,
    onLogout: async () => {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setProfileOpen(false);
      setAuthOpen(false);
    },
  }}
/>
      )}
      <Footer />


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

      <CartDrawer
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cart={cart}
        cartTotal={cartTotal}
        removeFromCart={removeFromCart}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        openCheckout={openCheckout}
        scrollToCatalog={scrollToCatalog}
      />
      <FavoritesDrawer
        favoritesOpen={favoritesOpen}
        setFavoritesOpen={setFavoritesOpen}
        favorites={favorites}
        products={products}
        addToCart={addToCart}
        toggleFavorite={toggleFavorite}
        scrollToCatalog={scrollToCatalog}
        Icon={Icon}
      />
  <ProfilePanel
    profileOpen={profileOpen}
    setProfileOpen={setProfileOpen}
    user={user}
    favorites={favorites}
    cartCount={cartCount}
    setFavoritesOpen={setFavoritesOpen}
    setCartOpen={setCartOpen}
    supabase={supabase}
    setUser={setUser}
    setIsAdmin={setIsAdmin}
    setAuthOpen={setAuthOpen}
    Icon={Icon}
  />
  {adminOpen && (
    <div className="admin-screen">
      <button
        type="button"
        className="admin-back"
        onClick={() => setAdminOpen(false)}
      >
        ← Вернуться в магазин
      </button>

      {adminRoleLoading ? (
        <div className="admin-login">
          <div className="admin-login-card">
            <div className="admin-login-logo">GR</div>
            <p className="eyebrow">GLOWRUSH ADMIN</p>
            <h1>Проверка доступа</h1>
            <p className="admin-login-text">
              Проверяем права администратора...
            </p>
          </div>
        </div>
      ) : isAdmin ? (
        <AdminPanel
          orders={orders}
          onLogout={async () => {
            await supabase.auth.signOut();
            setIsAdmin(false);
            setAdminOpen(false);
          }}
        />
      ) : null}
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












