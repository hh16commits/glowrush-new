import { Link } from "react-router-dom";
import Icon from "./Icon";
import { canAddToCart, getStockLabel } from "../lib/shop";

const formatPrice = (value) =>
  new Intl.NumberFormat("ru-RU").format(Number(value || 0));

export default function ProductCard({
  product,
  favorite = false,
  onFavorite,
  onAddToCart,
  variant = "default",
  onOpen,
  isNew = false,
}) {
  const discount =
    product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  const isHome = variant === "home";

  if (isHome) {
    return (
      <article
        className="home-v4-product-card"
        onClick={() => onOpen?.(product)}
      >
        <div className="home-v4-product-media">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <div className="home-v4-image-fallback">
              GLOWRUSH
            </div>
          )}

          {isNew && (
            <span className="home-v4-new-badge">
              NEW
            </span>
          )}

          {product.isBestseller && (
            <span className="home-v4-hit-badge">
              ХИТ
            </span>
          )}

          {onFavorite && (
            <button
              type="button"
              className={
                favorite
                  ? "home-v4-favorite is-active"
                  : "home-v4-favorite"
              }
              aria-label={
                favorite
                  ? "Убрать из избранного"
                  : "Добавить в избранное"
              }
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onFavorite(product.id);
              }}
            >
              <Icon
                name="heart"
                size={18}
                strokeWidth={favorite ? 2.2 : 1.7}
              />
            </button>
          )}
        </div>

        <div className="home-v4-product-info">
          <span className="home-v4-product-brand">
            {product.brand}
          </span>

          <h3>{product.name}</h3>

          <div className="home-v4-product-rating">
            ★ {product.rating || "—"}
            <span>
              ({product.reviewCount || 0})
            </span>
          </div>

          <div className="home-v4-product-bottom">
            <div className="home-v4-price-block">
              <strong>
                {formatPrice(product.price)} сум
              </strong>

              {!canAddToCart(product) && (
                <span
                  className={
                    product.stockStatus === "OUT_OF_STOCK"
                      ? "home-v4-stock-label is-out"
                      : "home-v4-stock-label"
                  }
                >
                  {getStockLabel(product.stockStatus)}
                </span>
              )}

              {product.stockStatus === "LOW_STOCK" &&
                canAddToCart(product) && (
                  <span className="home-v4-stock-label">
                    {getStockLabel(product.stockStatus)}
                  </span>
                )}
            </div>

            <button
              type="button"
              className="home-v4-add"
              aria-label={
                canAddToCart(product)
                  ? "Добавить в корзину"
                  : getStockLabel(product.stockStatus)
              }
              disabled={!canAddToCart(product)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onAddToCart?.(product);
              }}
            >
              <Icon name="plus" size={17} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="premium-product-card">
      <div className="premium-product-media">
        <Link
          to={`/product/${product.slug}`}
          className="premium-product-image"
        >
          {product.image ? (
            <>
              <img
                className="product-image-main"
                src={product.image}
                alt={product.name}
                loading="lazy"
              />

              {product.secondImage && (
                <img
                  className="product-image-hover"
                  src={product.secondImage}
                  alt=""
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="premium-placeholder">
              <span>GLOW</span>
              <small>RUSH</small>
            </div>
          )}
        </Link>

        <div className="product-badge-stack">
          {product.isBestseller && (
            <span className="product-badge badge-hit">
              ХИТ
            </span>
          )}

          {product.isNew && (
            <span className="product-badge badge-new">
              NEW
            </span>
          )}

          {discount > 0 && (
            <span className="product-badge badge-sale">
              −{discount}%
            </span>
          )}

          {product.stockStatus === "LOW_STOCK" && (
            <span className="product-badge badge-low">
              Заканчивается
            </span>
          )}
        </div>

        {onFavorite && (
          <button
            type="button"
            className={`product-favorite-button ${
              favorite ? "is-active" : ""
            }`}
            onClick={() => onFavorite(product.id)}
            aria-label={
              favorite
                ? "Убрать из избранного"
                : "Добавить в избранное"
            }
          >
            <Icon name="heart" size={19} />
          </button>
        )}

        <button
          type="button"
          className="product-quick-add"
          onClick={() => onAddToCart?.(product)}
          disabled={!canAddToCart(product)}
          aria-disabled={!canAddToCart(product)}
        >
          {getStockLabel(product.stockStatus)}
        </button>
      </div>

      <div className="premium-product-copy">
        <p className="premium-product-brand">
          {product.brand}
        </p>

        <Link
          to={`/product/${product.slug}`}
          className="premium-product-name"
        >
          {product.name}
        </Link>

        <p className="premium-product-benefit">
          {product.description}
        </p>

        <div className="premium-product-meta">
          <div className="product-rating-line">
            ★ {product.rating || "—"}
            <span>
              {" "}
              ({product.reviewCount || 0})
            </span>
          </div>

          <div className="premium-product-prices">
            <strong>
              {formatPrice(product.price)} сум
            </strong>

            {product.oldPrice > product.price && (
              <span>
                {formatPrice(product.oldPrice)} сум
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

