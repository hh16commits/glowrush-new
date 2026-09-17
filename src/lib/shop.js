const CART_KEY = "glowrush-cart";
const FAVORITES_KEY = "glowrush-favorites";

export const CART_UPDATED_EVENT = "glowrush:cart-updated";
export const FAVORITES_UPDATED_EVENT = "glowrush:favorites-updated";

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeArray(key, value, eventName) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(eventName));
}

export function getCart() {
  return readArray(CART_KEY);
}

export function setCart(cart) {
  writeArray(CART_KEY, cart, CART_UPDATED_EVENT);
}

export function getFavorites() {
  return readArray(FAVORITES_KEY);
}

export function setFavorites(favorites) {
  writeArray(FAVORITES_KEY, favorites, FAVORITES_UPDATED_EVENT);
}

export function addProductToCart(product, quantity = 1) {
  if (!product || product.stockStatus === "OUT_OF_STOCK") {
    return getCart();
  }

  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    return cart.map((item) =>
      item.id === product.id
        ? {
            ...item,
            quantity: Number(item.quantity || 0) + safeQuantity,
          }
        : item
    );
  }

  return [
    ...cart,
    {
      ...product,
      quantity: safeQuantity,
    },
  ];
}

export function removeProductFromCart(productId) {
  return getCart().filter((item) => item.id !== productId);
}

export function updateCartQuantity(productId, quantity) {
  if (quantity <= 0) {
    return removeProductFromCart(productId);
  }

  return getCart().map((item) =>
    item.id === productId
      ? { ...item, quantity: Number(quantity) }
      : item
  );
}

export function toggleProductFavorite(productId) {
  const favorites = getFavorites();

  return favorites.includes(productId)
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];
}

export function getStockLabel(stockStatus) {
  switch (stockStatus) {
    case "IN_STOCK":
      return "В наличии";
    case "LOW_STOCK":
      return "Осталось мало";
    case "OUT_OF_STOCK":
      return "Нет в наличии";
    default:
      return "Уточняется";
  }
}

export function canAddToCart(product) {
  return Boolean(product) && product.stockStatus !== "OUT_OF_STOCK";
}

export { CART_KEY, FAVORITES_KEY };
