import React from "react";
import Icon from "../App";

export default function CartDrawer({
  open,
  onClose,
  cart,
  cartTotal,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  openCheckout,
  scrollToCatalog,
}) {
  if (!open) return null;

  return (
    <div
      className="cart-overlay"
      onClick={onClose}
    >
      <aside
        className="cart-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-header">
          <h2>Корзина</h2>

          <button onClick={onClose}>
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <h3>Корзина пока пуста</h3>

            <button
              className="primary-button"
              onClick={() => {
                onClose();
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
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        -
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.id)
                    }
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