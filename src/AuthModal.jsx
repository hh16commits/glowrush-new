import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function AuthModal({ open, onClose }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user ?? null);
      }
    });

    return () => {
      mounted = false;
    };
  }, [open]);

  if (!open) return null;

  const handleTelegramLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "custom:telegram",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Telegram login error:", error);
      alert("Не удалось открыть вход через Telegram.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div
        className="auth-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="eyebrow">GLOWRUSH</p>

        {user ? (
          <>
            <h2>Вы вошли</h2>

            <p>
              {user.user_metadata?.name ||
                user.user_metadata?.preferred_username ||
                "Аккаунт Telegram"}
            </p>

            <button
              type="button"
              className="hero-button"
              onClick={handleLogout}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <h2>Вход в GlowRush</h2>

            <p>
              Войдите через Telegram, чтобы оформить заказ.
            </p>

            <button
              type="button"
              className="hero-button"
              onClick={handleTelegramLogin}
            >
              Войти через Telegram
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
