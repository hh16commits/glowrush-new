import { useState } from "react";
import { supabase } from "./lib/supabase";

function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTelegramLogin = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "custom:telegram",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Admin Telegram login error:", error);
      setError(error.message || "Не удалось войти через Telegram");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-logo">GR</div>

        <p className="eyebrow">GLOWRUSH ADMIN</p>

        <h1>Вход в админку</h1>

        <p className="admin-login-text">
          Войдите через Telegram. Доступ к админке получат только
          пользователи с ролью OWNER или ADMIN.
        </p>

        {error && <p className="admin-login-error">{error}</p>}

        <button
          type="button"
          onClick={handleTelegramLogin}
          disabled={loading}
        >
          {loading ? "Переход в Telegram..." : "Войти через Telegram"}
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
