export default function FavoritesDrawer({
  favoritesOpen,
  setFavoritesOpen,
  favorites,
  products,
  addToCart,
  toggleFavorite,
  scrollToCatalog,
  Icon
}) {
  if (!favoritesOpen) return null;

  return (
<div
          className="favorites-overlay"
          onClick={() => setFavoritesOpen(false)}
        >
          <aside
            className="favorites-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="favorites-header">
              <div>
                <p className="eyebrow">YOUR FAVORITES</p>
                <h2>Избранное</h2>
              </div>

              <button
                type="button"
                className="favorites-close"
                aria-label="Закрыть избранное"
                onClick={() => setFavoritesOpen(false)}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {favorites.length === 0 ? (
              <div className="favorites-empty">
                <div className="favorites-empty-icon">
                  <Icon name="heart" size={42} strokeWidth={1.5} />
                </div>

                <h3>Избранное пока пусто</h3>

                <p>
                  Нажимайте ♡ на товарах, которые хотите сохранить.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setFavoritesOpen(false)
                    scrollToCatalog()
                  }}
                >
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <div className="favorites-items">
                {products
                  .filter((product) => favorites.includes(product.id))
                  .map((product) => (
                    <div className="favorite-item" key={product.id}>

                      <div className="favorite-item-image">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                          />
                        ) : (
                          <span>{product.brand}</span>
                        )}
                      </div>

                      <div className="favorite-item-info">
                        <p className="product-brand">
                          {product.brand}
                        </p>

                        <h3>{product.name}</h3>

                        <strong>
                          {product.price.toLocaleString("ru-RU")} сум
                        </strong>

                        <button
                          type="button"
                          className="favorite-add-cart"
                          onClick={(event) => {
                            event.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          Добавить в корзину
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-favorite"
                        aria-label="Удалить из избранного"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                      >
                        <Icon name="heart" size={18} strokeWidth={2.2} />
                      </button>

                    </div>
                  ))}
              </div>
            )}

          </aside>
        </div>
  );
}








