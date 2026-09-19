import { Link } from "react-router-dom";
import Icon from "./Icon";
import { canAddToCart, getStockLabel } from "../lib/shop";

const formatPrice = (value) =>
  new Intl.NumberFormat("ru-RU").format(
    Number(value || 0)
  );

export default function ProductCard({
  product,
  favorite = false,
  onFavorite,
  onAddToCart,
}) {
  const discount =
    product.oldPrice > product.price
      ? Math.round(
          (1 - product.price / product.oldPrice) * 100
        )
      : 0;

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
          onClick={() => onAddToCart(product)}
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


