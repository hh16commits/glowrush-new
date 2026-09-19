import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function Header({
  user,
  isAdmin,
  onAdminOpen,
  onProfileOpen,
  onAuthOpen,
  searchOpen,
  search,
  onSearchChange,
  onSearchClose,
  onSearchToggle,
  favorites,
  cartCount,
  onFavoritesOpen,
  onCartOpen,
}) {
  return (
    <header className="site-header">
      <div className="header-inner">

        <Link to="/" className="brand-logo" aria-label="GlowRush">
          Glow<span>Rush</span>
        </Link>

        <nav className="main-nav">
  <Link to="/catalog">Каталог</Link>
  <Link to="/brands">Бренды</Link>
  <Link to="/new">Новинки</Link>
  <Link to="/care">Уход</Link>
  <Link to="/sale">Sale</Link>
  <Link to="/guide">Glow Guide</Link>
</nav>

        <div className="header-actions">

          {user ? (
            <button
              type="button"
              className="icon-button auth-header-button"
              onClick={() => {
                if (isAdmin) {
                  onAdminOpen();
                } else {
                  onProfileOpen();
                }
              }}
              aria-label="Открыть профиль"
            >
              {user?.user_metadata?.name ||
                user?.user_metadata?.preferred_username ||
                user?.email?.split("@")[0] ||
                "Профиль"}
            </button>
          ) : (
            <button
              type="button"
              className="icon-button auth-header-button"
              onClick={onAuthOpen}
              aria-label="Войти"
            >
              Войти
            </button>
          )}

          {searchOpen && (
            <div className="search-field">
              <input
                autoFocus
                type="search"
                placeholder="Поиск косметики..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />

              <button
                type="button"
                aria-label="Закрыть поиск"
                onClick={onSearchClose}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="icon-button"
            aria-label="Поиск"
            onClick={onSearchToggle}
          >
            ⌕
          </button>

          <button
            type="button"
            className="icon-button favorites-button"
            aria-label="Избранное"
            onClick={onFavoritesOpen}
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
            onClick={onCartOpen}
          >
            <Icon name="cart" size={20} />

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}

