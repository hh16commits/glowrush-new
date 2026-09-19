import { Link } from "react-router-dom";

const deliveryMethods = [
  {
    title: "Курьерская доставка",
    description: "Доставка до двери по городу.",
    price: "20 000 сум",
    freeFrom: "Бесплатно при заказе от 300 000 сум",
  },
  {
    title: "Самовывоз",
    description: "Заберите заказ самостоятельно из шоурума GlowRush.",
    price: "Бесплатно",
    freeFrom: "Без дополнительной платы за доставку",
  },
];

const cities = [
  "Ташкент",
  "Самарканд",
  "Бухара",
  "Андижан",
  "Наманган",
];

export default function DeliveryPage() {
  return (
    <main className="page-shell delivery-page">
      <section className="delivery-hero">
        <p className="eyebrow">GLOWRUSH</p>
        <h1>Доставка и оплата</h1>
        <p>
          Выберите удобный способ получения заказа. Условия доставки
          отображаются при оформлении заказа.
        </p>
      </section>

      <section className="delivery-section">
        <div className="delivery-section-heading">
          <p className="eyebrow">СПОСОБЫ ПОЛУЧЕНИЯ</p>
          <h2>Как получить заказ</h2>
        </div>

        <div className="delivery-methods">
          {deliveryMethods.map((method) => (
            <article className="delivery-method-card" key={method.title}>
              <div className="delivery-method-icon">→</div>

              <div>
                <h3>{method.title}</h3>
                <p>{method.description}</p>

                <div className="delivery-method-meta">
                  <strong>{method.price}</strong>
                  <span>{method.freeFrom}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="delivery-section">
        <div className="delivery-section-heading">
          <p className="eyebrow">ГОРОДА</p>
          <h2>Доставка доступна в</h2>
        </div>

        <div className="delivery-cities">
          {cities.map((city) => (
            <div className="delivery-city" key={city}>
              <span>●</span>
              {city}
            </div>
          ))}
        </div>
      </section>

      <section className="delivery-section delivery-payment">
        <div className="delivery-section-heading">
          <p className="eyebrow">ОПЛАТА</p>
          <h2>Оплата заказа</h2>
        </div>

        <div className="delivery-info-card">
          <h3>Оплата при оформлении</h3>
          <p>
            Способ оплаты и итоговая стоимость заказа отображаются
            на этапе оформления.
          </p>
        </div>
      </section>

      <section className="delivery-note">
        <strong>Стоимость доставки рассчитывается при оформлении.</strong>
        <p>
          Для курьерской доставки стоимость составляет 20 000 сум,
          а при заказе от 300 000 сум доставка бесплатна.
        </p>

        <Link to="/catalog" className="primary-button">
          Перейти в каталог
        </Link>
      </section>
    </main>
  );
}
