import { Link, useOutletContext } from "react-router-dom";

export default function AccountPage() {
  const {
    user,
    favorites,
    cartCount,
    setFavoritesOpen,
    setCartOpen,
    onLogout,
    setAuthOpen,
  } = useOutletContext();

  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.preferred_username ||
    user?.email?.split("@")[0] ||
    "Ваш аккаунт";

  const initial = displayName.charAt(0).toUpperCase();

  if (!user) {
    return (
      <main className="page-shell account-page">
        <section className="account-hero">
          <p className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</p>
          <h1>Войдите в аккаунт</h1>
          <p>
            Войдите, чтобы сохранять избранные товары, оформлять заказы
            и пользоваться возможностями GlowRush.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() => setAuthOpen(true)}
          >
            Войти
          </button>
        </section>

        <section className="account-links">
          <Link to="/catalog" className="account-link-card">
            <strong>Каталог</strong>
            <span>Перейти к товарам →</span>
          </Link>

          <Link to="/delivery" className="account-link-card">
            <strong>Доставка и оплата</strong>
            <span>Условия доставки →</span>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell account-page">
      <section className="account-hero">
        <p className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</p>

        <div className="account-user">
          <div className="account-avatar">{initial}</div>

          <div>
            <h1>{displayName}</h1>
            <p>{user.email || "Email не указан"}</p>
          </div>
        </div>
      </section>

      <section className="account-grid">
        <button
          type="button"
          className="account-card"
          onClick={() => setFavoritesOpen(true)}
        >
          <span className="account-card-icon">♡</span>
          <strong>Избранное</strong>
          <span>
            {favorites.length}{" "}
            {favorites.length === 1 ? "товар" : "товаров"}
          </span>
        </button>

        <button
          type="button"
          className="account-card"
          onClick={() => setCartOpen(true)}
        >
          <span className="account-card-icon">🛍</span>
          <strong>Корзина</strong>
          <span>
            {cartCount}{" "}
            {cartCount === 1 ? "товар" : "товаров"}
          </span>
        </button>

        <Link to="/catalog" className="account-card">
          <span className="account-card-icon">⌕</span>
          <strong>Каталог</strong>
          <span>Продолжить покупки</span>
        </Link>

        <Link to="/delivery" className="account-card">
          <span className="account-card-icon">→</span>
          <strong>Доставка</strong>
          <span>Способы и условия доставки</span>
        </Link>
      </section>

      <section className="account-info">
        <div>
          <p className="eyebrow">ДАННЫЕ АККАУНТА</p>

          <div className="account-info-row">
            <span>Email</span>
            <strong>{user.email || "Не указан"}</strong>
          </div>

          <div className="account-info-row">
            <span>Имя</span>
            <strong>{displayName}</strong>
          </div>
        </div>

        <button
          type="button"
          className="profile-logout"
          onClick={onLogout}
        >
          Выйти из аккаунта
        </button>
      </section>
    </main>
  );
}
