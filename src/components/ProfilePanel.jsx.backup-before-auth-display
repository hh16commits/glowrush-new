export default function ProfilePanel({
  profileOpen,
  setProfileOpen,
  user,
  favorites,
  cartCount,
  setFavoritesOpen,
  setCartOpen,
  supabase,
  setUser,
  setIsAdmin,
  setAuthOpen,
  Icon
}) {
  if (!profileOpen) return null;

  return (
    <div
      className="profile-overlay"
      onClick={() => setProfileOpen(false)}
    >
      <section
        className="profile-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile-panel-header">
          <div>
            <p className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</p>
            <h2>
              {user?.user_metadata?.name ||
                user?.user_metadata?.preferred_username ||
                user?.email?.split("@")[0] ||
                "Ваш аккаунт"}
            </h2>
          </div>

          <button
            type="button"
            className="profile-panel-close"
            onClick={() => setProfileOpen(false)}
            aria-label="Закрыть профиль"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="profile-panel-content">
          <div className="profile-user-card">
            <div className="profile-avatar">
              {(
                user?.user_metadata?.name ||
                user?.user_metadata?.preferred_username ||
                user?.email ||
                "G"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.user_metadata?.name ||
                  user?.user_metadata?.preferred_username ||
                  user?.email?.split("@")[0] ||
                  "Пользователь"}
              </strong>

              <p>{user?.email || "Telegram аккаунт"}</p>
            </div>
          </div>

          <div className="profile-menu">
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setFavoritesOpen(true);
              }}
            >
              <span>
                <Icon name="heart" size={19} />
              </span>
              <div>
                <strong>Избранное</strong>
                <small>
                  {favorites.length} сохраненных товаров
                </small>
              </div>
              <b>→</b>
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setCartOpen(true);
              }}
            >
              <span>
                <Icon name="cart" size={19} />
              </span>
              <div>
                <strong>Корзина</strong>
                <small>
                  {cartCount} товаров
                </small>
              </div>
              <b>→</b>
            </button>
          </div>

          <div className="profile-account-info">
            <p className="eyebrow">АККАУНТ</p>

            <div>
              <span>Email</span>
              <strong>{user?.email || "Не указан"}</strong>
            </div>
          </div>

          <button
            type="button"
            className="profile-logout"
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
              setIsAdmin(false);
              setProfileOpen(false);
              setAuthOpen(false);
            }}
          >
            Выйти из аккаунта
          </button>
        </div>
      </section>
    </div>
  );
}



