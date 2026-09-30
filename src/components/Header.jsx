import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { useLocale } from "../lib/locale";

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
  const { language, labels, setLocale } = useLocale();
  const [localeOpen, setLocaleOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">

        <Link to="/" className="brand-logo" aria-label="GlowRush">
          Glow<span>Rush</span>
        </Link>

        <nav className="main-nav">
  <Link to="/catalog">{labels.nav.catalog}</Link>
  <Link to="/brands">{labels.nav.brands}</Link>
  <Link to="/new">{labels.nav.new}</Link>
  <Link to="/care">{labels.nav.care}</Link>
  <Link to="/sale">{labels.nav.sale}</Link>
  <Link to="/guide">{labels.nav.guide}</Link>
</nav>

        <div className="header-actions">

          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="locale-switcher">
            <button
              type="button"
              className="locale-trigger"
              onClick={() => setLocaleOpen((value) => !value)}
            >
              {language}
              <span className="locale-chevron" aria-hidden="true"></span>
            </button>

            {localeOpen && (
              <div className="locale-menu">
                <div className="locale-section-title">{labels.language}</div>

                {["RU", "UZ", "EN"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      language === item
                        ? "locale-option active"
                        : "locale-option"
                    }
                    onClick={() => { setLocale({ language: item }); setLocaleOpen(false); }}
                  >
                    {item === "RU"
  ? "\u0420\u0443\u0441\u0441\u043a\u0438\u0439"
  : item === "UZ"
    ? "O\u2018zbekcha"
    : "English"}
                  </button>
                ))}
              </div>
            )}
          </div>


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
              aria-label="РћС‚РєСЂС‹С‚СЊ РїСЂРѕС„РёР»СЊ"
            >
              <Icon name="user" size={19} />
            </button>
          ) : (
            <button
              type="button"
              className="icon-button auth-header-button"
              onClick={onAuthOpen}
              aria-label="Р’РѕР№С‚Рё"
            >
              <Icon name="user" size={19} />
            </button>
          )}

          {searchOpen && (
            <div className="search-field">
              <input
                autoFocus
                type="search"
                placeholder={"\u041F\u043E\u0438\u0441\u043A \u043A\u043E\u0441\u043C\u0435\u0442\u0438\u043A\u0438\u002E\u002E\u002E"}
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />

              <button
                type="button"
                aria-label="Р—Р°РєСЂС‹С‚СЊ РїРѕРёСЃРє"
                onClick={onSearchClose}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="icon-button"
            aria-label="РџРѕРёСЃРє"
            onClick={onSearchToggle}
          >
            <Icon name="search" size={18} />
          </button>

          <button
            type="button"
            className="icon-button favorites-button"
            aria-label="РР·Р±СЂР°РЅРЅРѕРµ"
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
            aria-label="РљРѕСЂР·РёРЅР°"
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

        {mobileMenuOpen && (
          <div className="mobile-menu-overlay">
            <div
              className="mobile-menu-backdrop"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside className="mobile-menu-panel">
              <div className="mobile-menu-head">
                <span className="mobile-menu-brand">Glow<span>Rush</span></span>

                <button
                  type="button"
                  className="mobile-menu-close"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span></span>
                  <span></span>
                </button>
              </div>

              <div className="mobile-menu-search">
                <input
                  type="search"
                  aria-label="Search"
                  placeholder={"\u041F\u043E\u0438\u0441\u043A \u043A\u043E\u0441\u043C\u0435\u0442\u0438\u043A\u0438\u002E\u002E\u002E"}
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onSearchChange("")}
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>

              <nav className="mobile-menu-nav">
                <Link to="/catalog" onClick={() => setMobileMenuOpen(false)}>
                  {labels.nav.catalog}
                </Link>

                <Link to="/brands" onClick={() => setMobileMenuOpen(false)}>
                  {labels.nav.brands}
                </Link>

                <Link to="/new" onClick={() => setMobileMenuOpen(false)}>
                  {labels.nav.new}
                </Link>

                <Link to="/care" onClick={() => setMobileMenuOpen(false)}>
                  {labels.nav.care}
                </Link>

                <Link to="/sale" onClick={() => setMobileMenuOpen(false)}>
                  {labels.nav.sale}
                </Link>

                <Link to="/guide" onClick={() => setMobileMenuOpen(false)}>
                  {labels.nav.guide}
                </Link>
              </nav>

              <div className="mobile-menu-actions">
                <button
                  type="button"
                  className="mobile-menu-action"
                  onClick={() => {
                    onFavoritesOpen();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon name="heart" size={18} />
                  <span>
                    {language === "RU"
                      ? "\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435"
                      : language === "UZ"
                        ? "Tanlanganlar"
                        : "Favorites"}
                  </span>

                  {favorites.length > 0 && (
                    <strong>{favorites.length}</strong>
                  )}
                </button>

                <button
                  type="button"
                  className="mobile-menu-action"
                  onClick={() => {
                    onCartOpen();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon name="cart" size={18} />
                  <span>
                    {language === "RU"
                      ? "\u041a\u043e\u0440\u0437\u0438\u043d\u0430"
                      : language === "UZ"
                        ? "Savat"
                        : "Cart"}
                  </span>

                  {cartCount > 0 && (
                    <strong>{cartCount}</strong>
                  )}
                </button>
              </div>

              <div className="mobile-menu-language">
                <div className="mobile-menu-label">
                  {labels.language}
                </div>

                <div className="mobile-language-options">
                  {["RU", "UZ", "EN"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={language === item ? "active" : ""}
                      onClick={() => {
                        setLocale({ language: item });
                        setMobileMenuOpen(false);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}    </header>
  );
}

