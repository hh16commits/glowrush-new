import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { Link, NavLink, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Icon from "../components/Icon";

export default function PublicLayout() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const readCart = () => {
    try {
      const cart =
        JSON.parse(localStorage.getItem("glowrush-cart")) || [];

      setCartCount(
        cart.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        )
      );
    } catch {
      setCartCount(0);
    }
  };

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

    readCart();

    const handleCartUpdate = () => readCart();

    window.addEventListener(
      "glowrush:cart-updated",
      handleCartUpdate
    );

    window.addEventListener("storage", handleCartUpdate);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(
        "glowrush:cart-updated",
        handleCartUpdate
      );
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  return (
    <div className="glowrush public-layout">
      <header className="site-header public-site-header">
        <div className="header-inner">
          <Link
            to="/"
            className="brand-logo"
            aria-label="GlowRush"
          >
            Glow<span>Rush</span>
          </Link>

          <nav className="main-nav">
            <NavLink to="/catalog">Каталог</NavLink>
            <NavLink to="/brands">Бренды</NavLink>
            <NavLink to="/new">Новинки</NavLink>
            <NavLink to="/care">Уход</NavLink>
            <NavLink to="/sale">Sale</NavLink>
            <NavLink to="/guide">Glow Guide</NavLink>
          </nav>

          <div className="header-actions">
            <NavLink
              to="/catalog"
              className="header-search-link"
              aria-label="Поиск"
            >
              ⌕
            </NavLink>

            <Link
              to="/account"
              className="header-account-link"
            >
              {user
                ? user?.user_metadata?.name ||
                  user?.user_metadata?.preferred_username ||
                  user?.email?.split("@")[0] ||
                  "Профиль"
                : "Войти"}
            </Link>

            <Link
              to="/account"
              className="header-icon-link"
              aria-label="Избранное"
            >
              <Icon name="heart" size={19} />
            </Link>

            <Link
              to="/catalog"
              className="header-icon-link header-cart-link"
              aria-label="Корзина"
            >
              <Icon name="cart" size={19} />
              {cartCount > 0 && (
                <span className="header-cart-count">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="public-page-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
