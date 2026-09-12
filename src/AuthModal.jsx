import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

const OTP_LENGTH = 8;
const RESEND_SECONDS = 60;

function AuthModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (!open) return;

    setError("");
    setEmail("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setEmailSent(false);
    setResendSeconds(0);
  }, [open]);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleTelegramLogin = async () => {
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "custom:telegram",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (authError) {
      console.error("Telegram login error:", authError);
      setError("Не удалось открыть Telegram. Попробуйте ещё раз.");
      setLoading(false);
    }
  };

  const sendEmailCode = async (value = email) => {
    const normalizedEmail = value.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Введите email.");
      return false;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
    });

    setLoading(false);

    if (authError) {
      console.error("Email OTP send error:", authError);
      setError(authError.message || "Не удалось отправить код.");
      return false;
    }

    setEmail(normalizedEmail);
    setOtp(Array(OTP_LENGTH).fill(""));
    setEmailSent(true);
    setResendSeconds(RESEND_SECONDS);

    window.setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 80);

    return true;
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    await sendEmailCode();
  };

  const handleOtpChange = (index, value) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      setOtp((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    if (digits.length > 1) {
      const pasted = digits.slice(0, OTP_LENGTH).split("");

      setOtp((current) => {
        const next = [...current];

        pasted.forEach((digit, offset) => {
          if (index + offset < OTP_LENGTH) {
            next[index + offset] = digit;
          }
        });

        return next;
      });

      window.setTimeout(() => {
        otpRefs.current[
          Math.min(index + pasted.length, OTP_LENGTH - 1)
        ]?.focus();
      }, 0);

      return;
    }

    setOtp((current) => {
      const next = [...current];
      next[index] = digits;
      return next;
    });

    if (index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const values = pasted.split("");

    setOtp((current) => {
      const next = [...current];

      values.forEach((digit, index) => {
        next[index] = digit;
      });

      return next;
    });

    window.setTimeout(() => {
      otpRefs.current[Math.min(values.length, OTP_LENGTH) - 1]?.focus();
    }, 0);
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    const normalizedOtp = otp.join("");

    if (normalizedOtp.length !== OTP_LENGTH) {
      setError(`Введите полный ${OTP_LENGTH}-значный код.`);
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: normalizedOtp,
      type: "email",
    });

    setLoading(false);

    if (authError) {
      console.error("Email OTP verify error:", authError);
      setError("Неверный или просроченный код. Проверьте код и попробуйте ещё раз.");
      return;
    }

    setEmail("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setEmailSent(false);
    setResendSeconds(0);

    onClose();
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || loading) return;
    await sendEmailCode(email);
  };

  const handleChangeEmail = () => {
    setEmail("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setEmailSent(false);
    setResendSeconds(0);
    setError("");
  };

  return (
    <div className="auth-page" onClick={onClose}>
      <main
        className="auth-card"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="auth-card-header">
          <div className="auth-card-brand">
            <span>Glow</span><strong>Rush</strong>
          </div>

          <button
            type="button"
            className="auth-card-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="auth-card-progress">
          <span className={emailSent ? "" : "active"} />
          <span className={emailSent ? "active" : ""} />
        </div>

        <section className="auth-card-body">
          {!emailSent ? (
            <>
              <p className="auth-card-eyebrow">ВХОД</p>

              <h1>Войдите в GlowRush.</h1>

              <p className="auth-card-description">
                Войдите через Telegram или email,
                <br />
                чтобы оформлять заказы и сохранять избранное.
              </p>

              {error && (
                <div className="auth-card-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailLogin}>
                <label
                  className="auth-card-label"
                  htmlFor="glowrush-email"
                >
                  ЭЛЕКТРОННАЯ ПОЧТА
                </label>

                <input
                  id="glowrush-email"
                  className="auth-card-input"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />

                <button
                  type="submit"
                  className="auth-card-primary"
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Отправляем..." : "Получить код"}
                </button>
              </form>

              <div className="auth-card-or">
                <span />
                <b>или</b>
                <span />
              </div>

              <button
                type="button"
                className="auth-card-secondary"
                onClick={handleTelegramLogin}
                disabled={loading}
              >
                <span className="auth-telegram-icon">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M21.7 3.2 18.4 20c-.25 1.2-.92 1.5-1.86.94l-5.13-3.78-2.48 2.39c-.27.27-.5.5-1.03.5l.37-5.22 9.5-8.58c.41-.37-.09-.58-.64-.21L5.38 13.67.3 12.08c-1.1-.35-1.12-1.1.23-1.6L20.4 2.92c.92-.34 1.73.21 1.3.28Z" />
                  </svg>
                </span>

                {loading ? "Переход..." : "Войти через Telegram"}
              </button>

              <p className="auth-card-terms">
                Продолжая, вы соглашаетесь с условиями
                <br />
                использования GlowRush.
              </p>
            </>
          ) : (
            <>
              <p className="auth-card-eyebrow">ПОДТВЕРЖДЕНИЕ</p>

              <h1>Введите код.</h1>

              <p className="auth-card-description">
                Мы отправили код на
                <br />
                <strong>{email}</strong>
              </p>

              {error && (
                <div className="auth-card-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div
                  className="auth-card-otp"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleOtpChange(index, event.target.value)
                      }
                      onKeyDown={(event) =>
                        handleOtpKeyDown(index, event)
                      }
                      aria-label={`Цифра ${index + 1}`}
                      disabled={loading}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="auth-card-primary"
                  disabled={
                    loading ||
                    otp.join("").length !== OTP_LENGTH
                  }
                >
                  {loading ? "Проверяем..." : "Войти"}
                </button>
              </form>

              <div className="auth-card-links">
                {resendSeconds > 0 ? (
                  <span>
                    Отправить код повторно через {resendSeconds}с
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    Отправить код повторно
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={loading}
                >
                  ← Изменить email
                </button>
              </div>
            </>
          )}
        </section>

        <footer className="auth-card-footer">
          <span>GLOWRUSH</span>
          <span>Безопасный вход</span>
        </footer>
      </main>
    </div>
  );
}

export default AuthModal;
