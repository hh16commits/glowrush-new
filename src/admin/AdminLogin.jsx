import { useState } from "react";

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password === "GlowRush2026") {
      sessionStorage.setItem("glowrush-admin", "true");
      onLogin();
      return;
    }

    setError("Неверный пароль");
    setPassword("");
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-logo">GR</div>

        <p className="eyebrow">GLOWRUSH ADMIN</p>

        <h1>Вход в админку</h1>

        <p className="admin-login-text">
          Введите пароль администратора
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            autoFocus
          />

          {error && (
            <p className="admin-login-error">{error}</p>
          )}

          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
