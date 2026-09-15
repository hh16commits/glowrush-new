import { Link } from "react-router-dom";

const guideSections = [
  {
    number: "01",
    title: "Определи свой тип кожи",
    text: "Жирная, сухая, комбинированная или чувствительная — правильный уход начинается с базового понимания кожи.",
    links: [
      { label: "Жирная кожа", to: "/catalog?category=serums" },
      { label: "Сухая кожа", to: "/catalog?category=creams" },
      { label: "Чувствительная кожа", to: "/catalog?category=cleansing" },
    ],
  },
  {
    number: "02",
    title: "Собери базовую рутину",
    text: "Не обязательно использовать десять средств. Начни с очищения, увлажнения и SPF, затем добавляй активы.",
    links: [
      { label: "Очищение", to: "/catalog?category=cleansing" },
      { label: "Тонеры", to: "/catalog?category=toners" },
      { label: "Кремы", to: "/catalog?category=creams" },
      { label: "SPF", to: "/catalog?category=spf" },
    ],
  },
  {
    number: "03",
    title: "Выбирай активы по задаче",
    text: "Ниацинамид, BHA, центелла, прополис и другие ингредиенты работают на разные задачи кожи.",
    links: [
      { label: "Сыворотки", to: "/catalog?category=serums" },
      { label: "Эссенции", to: "/catalog?category=essences" },
      { label: "Ампулы", to: "/catalog?category=ampoules" },
    ],
  },
  {
    number: "04",
    title: "Вводи новые средства постепенно",
    text: "Особенно когда речь идёт об активных ингредиентах. Так проще понять реакцию кожи и не перегрузить рутину.",
    links: [
      { label: "Новинки", to: "/new" },
      { label: "Вся коллекция", to: "/catalog" },
    ],
  },
];

const principles = [
  "Очищение без ощущения стянутости.",
  "Увлажнение — основа здорового кожного барьера.",
  "Активы добавляй постепенно.",
  "SPF нужен каждый день.",
];

export default function GuidePage() {
  return (
    <main className="guide-page">
      <section className="guide-hero">
        <div className="guide-hero__eyebrow">GLOWRUSH GUIDE</div>
        <h1>Понятный уход<br />без лишнего.</h1>
        <p>
          Разбираемся в корейской skincare-рутине простым языком:
          от типа кожи до правильного порядка средств.
        </p>
      </section>

      <section className="guide-intro">
        <div>
          <span className="guide-kicker">START HERE</span>
          <h2>С чего начать?</h2>
        </div>

        <div className="guide-principles">
          {principles.map((item, index) => (
            <div className="guide-principle" key={item}>
              <span>0{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="guide-grid">
        {guideSections.map((section) => (
          <article className="guide-card" key={section.number}>
            <div className="guide-card__number">{section.number}</div>

            <div className="guide-card__content">
              <h3>{section.title}</h3>
              <p>{section.text}</p>

              <div className="guide-card__links">
                {section.links.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                    <span>↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="guide-routine">
        <div className="guide-routine__copy">
          <span className="guide-kicker">DAILY ROUTINE</span>
          <h2>Простая схема на каждый день.</h2>
          <p>
            Утром — очищение, увлажнение и SPF. Вечером —
            очищение, уход по задачам и крем.
          </p>
        </div>

        <div className="guide-routine__steps">
          {[
            ["01", "Cleanse", "Очищение"],
            ["02", "Hydrate", "Увлажнение"],
            ["03", "Treat", "Активный уход"],
            ["04", "Protect", "SPF"],
          ].map(([number, title, subtitle]) => (
            <div className="guide-routine__step" key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="guide-cta">
        <div>
          <span className="guide-kicker">GLOWRUSH COLLECTION</span>
          <h2>Найди средства<br />для своей рутины.</h2>
        </div>

        <Link className="guide-cta__button" to="/catalog">
          Смотреть каталог <span>→</span>
        </Link>
      </section>
    </main>
  );
}
