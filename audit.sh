#!/data/data/com.termux/files/usr/bin/bash

echo "========================================"
echo "       GLOWRUSH FULL AUDIT"
echo "========================================"

echo
echo "=== PROJECT ==="
pwd
echo "--- package.json ---"
cat package.json

echo
echo "=== SOURCE TREE ==="
find src -type f | sort

echo
echo "=== ROUTES ==="
grep -RniE "createBrowserRouter|path:|Route|Routes|Outlet" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== LAYOUT / APP ==="
grep -RniE "PublicLayout|ShopLayout|App.jsx|HomePage|Header|CartDrawer|FavoritesDrawer" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== CART ==="
grep -RniE "localStorage|glowrush-cart|getCart|setCart|addProductToCart|updateCartQuantity|removeProductFromCart|addToCart|cartCount|CartDrawer" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== FAVORITES ==="
grep -RniE "glowrush-favorites|getFavorites|setFavorites|toggleProductFavorite|favorites|FavoritesDrawer" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== INVENTORY / STOCK ==="
grep -RniE "Inventory|inventory|stockStatus|available|quantity|Warehouse|Batch|BatchLocation|OUT_OF_STOCK|LOW_STOCK|IN_STOCK" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== SUPABASE ==="
grep -RniE "supabase|create_order|rpc\\(|\\.from\\(" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== AUTH ==="
grep -RniE "supabase.auth|signIn|signUp|signOut|onAuthStateChange|session|user" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== PRODUCT DATA ==="
grep -RniE "ProductTranslation|ProductImage|Brand|Category|price|oldPrice|rating|reviewCount|mainImage|images" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== CHECKOUT ==="
grep -RniE "Checkout|checkout|create_order|phone|delivery|courier|pickup|Ташкент|город|Подтвердить заказ" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== ACCOUNT / DELIVERY ==="
grep -RniE "AccountPage|DeliveryPage|/account|/delivery|Профиль|Доставка|Избранное|Корзина" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== PRODUCT CARDS ==="
find src -type f \( -name "*.js" -o -name "*.jsx" \) -print0 2>/dev/null |
  xargs -0 grep -lE "ProductCard|HomeProductCard" 2>/dev/null | sort

echo
echo "=== DUPLICATED CART ==="
grep -RniE "setCart\\(|localStorage\\.setItem\\(['\"]glowrush-cart|addProductToCart\\(|setCartState\\(" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== DUPLICATED FAVORITES ==="
grep -RniE "setFavorites\\(|localStorage\\.setItem\\(['\"]glowrush-favorites|toggleProductFavorite\\(" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== IMAGE GALLERY ==="
grep -RniE "mainImage|images\\.map|images\\?|ProductImage|thumbnail|gallery|lightbox" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== CATEGORY MAP ==="
grep -RniE "CATEGORY_SLUG_MAP|cleansing|toners|essences|ampoules|serums|creams|spf|masks" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== HARDCODED UI ==="
grep -RniE "\"(В наличии|Нет в наличии|Осталось мало|Корзина|Избранное|Профиль|Доставка|Каталог|Новинки|Акции)\"|'(В наличии|Нет в наличии|Осталось мало|Корзина|Избранное|Профиль|Доставка|Каталог|Новинки|Акции)'" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== ADMIN ==="
grep -RniE "admin|isAdmin|role|user_metadata|service_role|SUPABASE_SERVICE" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== DEBUG CODE ==="
grep -RniE "console\\.(log|error|warn)|alert\\(|debugger" src \
  --include="*.js" --include="*.jsx" 2>/dev/null

echo
echo "=== CSS SIZE ==="
find src -type f -name "*.css" -exec wc -c {} \; 2>/dev/null

echo
echo "=== BACKUP FILES ==="
find src -type f | grep -Ei "backup|bak|old|copy" | sort

echo
echo "=== ENV FILES ==="
find . -maxdepth 2 -type f \( -name ".env" -o -name ".env.local" -o -name ".env.*" \) -print

echo
echo "=== GIT STATUS ==="
git status --short --branch 2>/dev/null || true

echo
echo "=== BUILD ==="
npm run build

echo
echo "========================================"
echo "          AUDIT FINISHED"
echo "========================================"
