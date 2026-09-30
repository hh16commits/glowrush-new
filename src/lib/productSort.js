export function sortBestsellers(products = []) {
  return [...products].sort((a, b) => {
    const reviewDiff =
      (b.reviewCount || 0) - (a.reviewCount || 0);

    if (reviewDiff !== 0) {
      return reviewDiff;
    }

    return (b.rating || 0) - (a.rating || 0);
  });
}

export function sortNewProducts(products = []) {
  return [...products].sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}
