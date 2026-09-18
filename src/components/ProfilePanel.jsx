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
      ? `Telegram В· @${username}`
      : "Telegram";
  }

  if (user?.email) {
    return user.email;
  }

  return "РЎРїРѕСЃРѕР± РІС…РѕРґР° РЅРµ СѓРєР°Р·Р°РЅ";
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
            Р›РР§РќР«Р™ РљРђР‘РРќР•Рў
          </p>

          <h2>
            {user?.user_metadata?.name ||
              user?.user_metadata?.preferred_username ||
              user?.email?.split("@")[0] ||
              "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ"}
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
                  "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ"}
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
                  РР·Р±СЂР°РЅРЅРѕРµ
                </strong>

                <small>
                  {favorites.length} СЃРѕС…СЂР°РЅРµРЅРЅС‹С… С‚РѕРІР°СЂРѕРІ
                </small>
              </div>

              <b>
                в†’
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
                  РљРѕСЂР·РёРЅР°
                </strong>

                <small>
                  {cartCount} С‚РѕРІР°СЂРѕРІ
                </small>
              </div>

              <b>
                в†’
              </b>
            </button>

          </div>



          <div className="profile-account-info">

            <p className="eyebrow">
              РђРљРљРђРЈРќРў
            </p>

            <div>
              <span>
                РЎРїРѕСЃРѕР± РІС…РѕРґР°
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
            Р’С‹Р№С‚Рё РёР· Р°РєРєР°СѓРЅС‚Р°
          </button>


        </div>

      </section>
    </div>
  );
}



