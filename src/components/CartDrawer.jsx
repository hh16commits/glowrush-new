import React from "react";
import Icon from "./Icon";

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
          <h2>РљРѕСЂР·РёРЅР°</h2>

          <button onClick={onClose}>
            Г—
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <h3>РљРѕСЂР·РёРЅР° РїРѕРєР° РїСѓСЃС‚Р°</h3>

            <button
              className="primary-button"
              onClick={() => {
                onClose();
                scrollToCatalog();
              }}
            >
              РџРµСЂРµР№С‚Рё РІ РєР°С‚Р°Р»РѕРі
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
                      {item.price.toLocaleString("ru-RU")} СЃСѓРј
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
                    Г—
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <strong>
                {cartTotal.toLocaleString("ru-RU")} СЃСѓРј
              </strong>

              <button
                className="primary-button"
                onClick={openCheckout}
              >
                РћС„РѕСЂРјРёС‚СЊ Р·Р°РєР°Р·
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
