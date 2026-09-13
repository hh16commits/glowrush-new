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
    <div
      className="cart-overlay"
      onClick={closeCart}
    >
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
                <div
                  className="cart-item"
                  key={item.id}
                >
                  <div>
                    <h3>{item.name}</h3>

                    <strong>
                      {item.price.toLocaleString("ru-RU")} сум
                    </strong>

                    <div>
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label="Уменьшить количество"
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        aria-label="Увеличить количество"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Удалить ${item.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <strong>
                {cartTotal.toLocaleString("ru-RU")} сум
              </strong>

              <button
                type="button"
                className="primary-button"
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
