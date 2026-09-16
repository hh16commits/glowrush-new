import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <Link to="/" className="site-footer-logo">
              Glow<span>Rush</span>
            </Link>

            <p className="site-footer-tagline">
              Корейская косметика для твоего glow.
            </p>

            <p className="site-footer-note">
              Подбираем уход проще — от первого шага до полноценной рутины.
            </p>
          </div>

          <div className="site-footer-column">
            <span className="site-footer-title">МАГАЗИН</span>
            <Link to="/catalog">Каталог</Link>
            <Link to="/brands">Бренды</Link>
            <Link to="/new">Новинки</Link>
            <Link to="/sale">Акции</Link>
          </div>

          <div className="site-footer-column">
            <span className="site-footer-title">ПОКУПАТЕЛЯМ</span>
            <Link to="/delivery">Доставка</Link>
            <Link to="/account">Профиль</Link>
            <Link to="/guide">Glow Guide</Link>
            <a href="/catalog">Помощь с выбором</a>
          </div>

          <div className="site-footer-column">
            <span className="site-footer-title">ИНФОРМАЦИЯ</span>
            <a href="/delivery">Оплата и доставка</a>
            <a href="/delivery">Возврат</a>
            <a href="/guide">FAQ</a>
            <a href="/account">Контакты</a>
          </div>

          <div className="site-footer-column">
            <span className="site-footer-title">СОЦСЕТИ</span>
            <a
              href="https://instagram.com/glowrush.uz"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://t.me/glowrush_uz"
              target="_blank"
              rel="noreferrer"
            >
              Telegram
            </a>
            <span className="site-footer-muted">TikTok — скоро</span>
          </div>
        </div>

        <div className="site-footer-middle">
          <div>
            <span className="site-footer-small">
              Мы делаем корейский уход понятнее.
            </span>
          </div>

          <div className="site-footer-locale">
            <span>RU</span>
            <span>UZ</span>
            <span>EN</span>
            <span>UZS</span>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© 2026 GlowRush</span>

          <div className="site-footer-legal">
            <span>Политика конфиденциальности</span>
            <span>Условия использования</span>
            <span>Публичная оферта</span>
          </div>
        </div>
      </div>
    </footer>
  );
}