import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function AuthModal({ user, onClose }) {
  const [mode, setMode] = useState(user ? "account" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resetMessages = () => {
    setMessage("");
    setError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    resetMessages();
    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    onClose();
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    resetMessages();

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов.");
      return;
    }

    setLoading(true);

    const {
      data,
      error: signupError,
    } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    if (data.session) {
      onClose();
      return;
    }

    setMessage(
      "Регистрация выполнена. Проверьте почту для подтверждения аккаунта."
    );
  };

  const handleLogout = async () => {
    setLoading(true);

    const { error: logoutError } = await supabase.auth.signOut();

    setLoading(false);

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    onClose();
  };

  return (
    <div
      className="auth-overlay"
      onClick={onClose}
    >
      <div
        className="auth-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>

        {mode === "account" && user ? (
          <>
            <div className="auth-header">
              <span className="auth-icon">👤</span>
              <h2>Мой аккаунт</h2>
              <p>{user.email}</p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="button"
              className="auth-submit"
              disabled={loading}
              onClick={handleLogout}
            >
              {loading ? "Выходим..." : "Выйти"}
            </button>
          </>
        ) : (
          <>
            <div className="auth-header">
              <span className="auth-icon">👤</span>

              <h2>
                {mode === "login"
                  ? "Вход"
                  : "Регистрация"}
              </h2>

              <p>
                {mode === "login"
                  ? "Войдите в аккаунт GlowRush"
                  : "Создайте аккаунт GlowRush"}
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={
                mode === "login"
                  ? handleLogin
                  : handleSignup
              }
            >
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Пароль
                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Минимум 6 символов"
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  required
                />
              </label>

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="auth-message">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Подождите..."
                  : mode === "login"
                    ? "Войти"
                    : "Зарегистрироваться"}
              </button>
            </form>

            <div className="auth-switch">
              {mode === "login" ? (
                <>
                  <span>Нет аккаунта?</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetMessages();
                      setMode("signup");
                    }}
                  >
                    Зарегистрироваться
                  </button>
                </>
              ) : (
                <>
                  <span>Уже есть аккаунт?</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetMessages();
                      setMode("login");
                    }}
                  >
                    Войти
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}