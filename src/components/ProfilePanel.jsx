import { supabase } from "../lib/supabase";
import Icon from "./Icon";
const getAuthMethodLabel = (user) => {
  const provider = String(
    user?.app_metadata?.provider || ""
  ).toLowerCase();

  const username =
    user?.user_metadata?.preferred_username ||
    user?.user_metadata?.username;

  if (provider.includes("telegram")) {
    return username
      ? `Telegram · @${username}`
      : "Telegram";
  }

  if (user?.email) {
    return user.email;
  }

  return "Способ входа не указан";
};

export default function ProfilePanel({
  open,
  onClose,
  user,
  setUser,
  setIsAdmin,
  setAuthOpen,
  setProfileOpen,
  setFavoritesOpen,
  setCartOpen,
  favorites = [],
  cartCount = 0,
}) {
  if (!open) return null;

  return (
    <div className="profile-overlay">
      <section className="profile-panel">
        <div className="profile-panel-header">
          <p className="eyebrow">
            ЛИЧНЫЙ КАБИНЕТ
          </p>

          <h2>
            {user?.user_metadata?.name ||
              user?.user_metadata?.preferred_username ||
              user?.email?.split("@")[0] ||
              "Пользователь"}
          </h2>

          <button
            type="button"
            onClick={onClose}
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

              <p>
                {getAuthMethodLabel(user)}
              </p>
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
                <strong>
                  Избранное
                </strong>

                <small>
                  {favorites.length} сохраненных товаров
                </small>
              </div>

              <b>
                →
              </b>
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
                <strong>
                  Корзина
                </strong>

                <small>
                  {cartCount} товаров
                </small>
              </div>

              <b>
                →
              </b>
            </button>

          </div>



          <div className="profile-account-info">

            <p className="eyebrow">
              АККАУНТ
            </p>

            <div>
              <span>
                Способ входа
              </span>

              <strong>
                {getAuthMethodLabel(user)}
              </strong>
            </div>

          </div>



          <button
            type="button"
            className="profile-logout"
            onClick={async () => {
              await supabase.auth.signOut();

              setUser(null);

              if (setIsAdmin) {
                setIsAdmin(false);
              }

              setProfileOpen(false);

              if (setAuthOpen) {
                setAuthOpen(false);
              }
            }}
          >
            Выйти из аккаунта
          </button>


        </div>

      </section>
    </div>
  );
}



