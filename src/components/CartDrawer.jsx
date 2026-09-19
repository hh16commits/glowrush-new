import React from "react";

export default function CartDrawer({
  cartOpen,
  setCartOpen,
  cart,
  cartTotal,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  openCheckout,
  scrollToCatalog,
}) {
  if (!cartOpen) return null;

  const closeCart = () => setCartOpen(false);

  return (
    <div className="cart-overlay" onClick={closeCart}>
      <aside
        className="cart-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-header">
          <h2>Корзина</h2>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Закрыть корзину"
          >
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <h3>Корзина пока пуста</h3>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                closeCart();
                scrollToCatalog();
              }}
            >
              Перейти в каталог
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                      />
                    ) : (
                      <span>GLOWRUSH</span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    {item.brand && (
                      <div className="product-brand">
                        {item.brand}
                      </div>
                    )}

                    <h3>{item.name}</h3>

                    <strong>
                      {Number(item.price || 0).toLocaleString("ru-RU")} сум
                    </strong>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label="Уменьшить количество"
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        aria-label="Увеличить количество"
                        disabled={item.stockStatus === "OUT_OF_STOCK"}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="remove-cart-item"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Удалить ${item.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Итого</span>
                <strong>
                  {Number(cartTotal || 0).toLocaleString("ru-RU")} сум
                </strong>
              </div>

              <button
                type="button"
                className="primary-button checkout-button"
                onClick={openCheckout}
              >
                Оформить заказ
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
