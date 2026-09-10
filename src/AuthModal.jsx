import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function AuthModal({ user, onClose }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendCode = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: functionError } =
      await supabase.functions.invoke("telegram-send-code", {
        body: {
          action: "send",
          phone,
        },
      });

    setLoading(false);

    if (functionError) {
      setError(functionError.message || "Не удалось отправить код");
      return;
    }

    if (!data?.success || !data?.request_id) {
      setError(data?.error || "Не удалось отправить код");
      return;
    }

    setRequestId(data.request_id);
    setStep("code");
    setMessage("Код отправлен в Telegram. Проверьте чат «Verification Codes».");
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: functionError } =
      await supabase.functions.invoke("telegram-send-code", {
        body: {
          action: "verify",
          phone,
          request_id: requestId,
          code,
        },
      });

    setLoading(false);

    if (functionError) {
      setError(functionError.message || "Не удалось проверить код");
      return;
    }

    if (!data?.success || !data?.session) {
      setError(data?.error || "Не удалось войти");
      return;
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    if (sessionError) {
      setError(sessionError.message || "Не удалось создать сессию");
      return;
    }

    onClose();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const displayPhone =
    user?.user_metadata?.phone ||
    user?.phone ||
    "Телефон не указан";

  if (user) {
    return (
      <div className="auth-overlay" onMouseDown={onClose}>
        <div
          className="auth-modal"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="auth-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>

          <div className="auth-header">
            <div className="auth-icon">♡</div>
            <h2>Мой аккаунт</h2>
            <p>Вы вошли в GlowRush</p>
          </div>

          <div className="auth-account">
            <div className="auth-account-label">Телефон</div>
            <div className="auth-account-value">{displayPhone}</div>
          </div>

          <button
            type="button"
            className="auth-submit"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-overlay" onMouseDown={onClose}>
      <div
        className="auth-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className="auth-header">
          <div className="auth-icon">♡</div>
          <h2>Вход в GlowRush</h2>
          <p>
            {step === "phone"
              ? "Введите номер телефона"
              : "Введите код из Telegram"}
          </p>
        </div>

        {step === "phone" ? (
          <form className="auth-form" onSubmit={handleSendCode}>
            <label htmlFor="auth-phone">Номер телефона</label>

            <input
              id="auth-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+998901234567"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />

            {error && <div className="auth-error">{error}</div>}

            {message && <div className="auth-message">{message}</div>}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Отправляем..." : "Получить код в Telegram"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyCode}>
            <label htmlFor="auth-code">Код из Telegram</label>

            <input
              id="auth-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={8}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              required
            />

            {message && <div className="auth-message">{message}</div>}

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Проверяем..." : "Войти"}
            </button>

            <button
              type="button"
              className="auth-switch"
              onClick={() => {
                setStep("phone");
                setCode("");
                setRequestId("");
                setError("");
                setMessage("");
              }}
              disabled={loading}
            >
              Изменить номер
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
