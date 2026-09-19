from pathlib import Path

path = Path("src/admin/AdminPanel.jsx")
text = path.read_text(encoding="utf-8-sig")

# ------------------------------------------------------------
# 1. Добавляем состояния склада
# ------------------------------------------------------------

needle = '''  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
'''

replacement = '''  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [inventoryWarehouses, setInventoryWarehouses] = useState([]);
  const [inventorySuppliers, setInventorySuppliers] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventorySaving, setInventorySaving] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [inventorySuccess, setInventorySuccess] = useState("");

  const [inventoryForm, setInventoryForm] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    costPrice: "",
    batchNumber: "",
    expirationDate: "",
    supplierId: "",
    reason: "",
  });

  const loadInventoryData = async () => {
    setInventoryLoading(true);
    setInventoryError("");

    try {
      const [
        { data: products, error: productsError },
        { data: warehouses, error: warehousesError },
        { data: suppliers, error: suppliersError },
      ] = await Promise.all([
        supabase
          .from("Product")
          .select(`
            id,
            sku,
            slug,
            price,
            costPrice,
            stockStatus,
            brand:Brand (
              translations:BrandTranslation (
                name,
                locale
              )
            ),
            translations:ProductTranslation (
              name,
              locale
            )
          `)
          .eq("isActive", true)
          .order("createdAt", { ascending: false }),

        supabase
          .from("Warehouse")
          .select("id, code, name, city")
          .eq("isActive", true)
          .order("name"),

        supabase
          .from("Supplier")
          .select("id, name, country")
          .order("name"),
      ]);

      if (productsError) throw productsError;
      if (warehousesError) throw warehousesError;
      if (suppliersError) throw suppliersError;

      setInventoryProducts(products || []);
      setInventoryWarehouses(warehouses || []);
      setInventorySuppliers(suppliers || []);

      setInventoryForm((current) => ({
        ...current,
        warehouseId:
          current.warehouseId ||
          warehouses?.[0]?.id ||
          "",
      }));
    } catch (error) {
      console.error("Failed to load inventory data:", error);
      setInventoryError(
        error?.message || "Не удалось загрузить складские данные"
      );
    } finally {
      setInventoryLoading(false);
    }
  };

  const openInventory = async () => {
    setInventoryOpen(true);
    setInventorySuccess("");
    setInventoryError("");
    await loadInventoryData();
  };

  const closeInventory = () => {
    if (inventorySaving) return;

    setInventoryOpen(false);
    setInventoryError("");
    setInventorySuccess("");
  };

  const submitInventoryReceipt = async (event) => {
    event.preventDefault();

    setInventorySaving(true);
    setInventoryError("");
    setInventorySuccess("");

    const quantity = Number(inventoryForm.quantity);
    const costPrice = Number(inventoryForm.costPrice);

    if (!inventoryForm.productId) {
      setInventoryError("Выберите товар.");
      setInventorySaving(false);
      return;
    }

    if (!inventoryForm.warehouseId) {
      setInventoryError("Выберите склад.");
      setInventorySaving(false);
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setInventoryError("Количество должно быть целым числом больше 0.");
      setInventorySaving(false);
      return;
    }

    if (!Number.isInteger(costPrice) || costPrice < 0) {
      setInventoryError("Закупочная цена должна быть целым числом не меньше 0.");
      setInventorySaving(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc(
        "receive_inventory",
        {
          p_product_id: inventoryForm.productId,
          p_warehouse_id: inventoryForm.warehouseId,
          p_quantity: quantity,
          p_cost_price: costPrice,
          p_batch_number:
            inventoryForm.batchNumber.trim() || null,
          p_expiration_date:
            inventoryForm.expirationDate
              ? new Date(
                  `${inventoryForm.expirationDate}T00:00:00`
                ).toISOString()
              : null,
          p_supplier_id:
            inventoryForm.supplierId || null,
          p_reason:
            inventoryForm.reason.trim() || null,
        }
      );

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;

      setInventorySuccess(
        `Приход принят: ${result?.quantityReceived || quantity} шт. Остаток: ${result?.newAvailable ?? "—"} шт.`
      );

      setInventoryForm((current) => ({
        ...current,
        productId: "",
        quantity: "",
        costPrice: "",
        batchNumber: "",
        expirationDate: "",
        supplierId: "",
        reason: "",
      }));
    } catch (error) {
      console.error("Failed to receive inventory:", error);

      const message =
        error?.message ||
        "Не удалось оформить приход товара.";

      const messages = {
        NOT_AUTHENTICATED:
          "Сессия администратора не найдена. Войдите в аккаунт заново.",
        USER_NOT_FOUND:
          "Пользователь не найден.",
        USER_NOT_ACTIVE:
          "Учётная запись неактивна.",
        FORBIDDEN:
          "У вас нет прав для оформления прихода.",
        PRODUCT_NOT_FOUND_OR_INACTIVE:
          "Товар не найден или неактивен.",
        WAREHOUSE_NOT_FOUND_OR_INACTIVE:
          "Склад не найден или неактивен.",
        SUPPLIER_NOT_FOUND:
          "Поставщик не найден.",
        QUANTITY_MUST_BE_POSITIVE:
          "Количество должно быть больше нуля.",
        COST_PRICE_INVALID:
          "Некорректная закупочная цена.",
      };

      setInventoryError(
        messages[message] || message
      );
    } finally {
      setInventorySaving(false);
    }
  };
'''

if needle not in text:
    raise SystemExit("Не найден блок состояний AdminPanel")

text = text.replace(needle, replacement, 1)

# ------------------------------------------------------------
# 2. Добавляем кнопку склада в header
# ------------------------------------------------------------

needle = '''            <button
              type="button"
              className="admin-export"
              onClick={exportOrders}
              disabled={!orders.length}
            >
              Экспорт CSV
            </button>

            <button
              type="button"
              className="admin-logout"
'''

replacement = '''            <button
              type="button"
              className="admin-export"
              onClick={openInventory}
            >
              📦 Приход товара
            </button>

            <button
              type="button"
              className="admin-export"
              onClick={exportOrders}
              disabled={!orders.length}
            >
              Экспорт CSV
            </button>

            <button
              type="button"
              className="admin-logout"
'''

if needle not in text:
    raise SystemExit("Не найден блок кнопок header")

text = text.replace(needle, replacement, 1)

# ------------------------------------------------------------
# 3. Добавляем складской блок перед фильтрами
# ------------------------------------------------------------

needle = '''      <div className="admin-filters">
        <input
'''

replacement = '''      <div
        className="admin-revenue-cards"
        style={{ marginTop: "20px" }}
      >
        <div className="admin-revenue-card admin-revenue-main">
          <span>Склад</span>
          <strong>Приход товара</strong>
          <button
            type="button"
            className="admin-export"
            style={{ marginTop: "12px" }}
            onClick={openInventory}
          >
            Оформить приход
          </button>
        </div>

        <div className="admin-revenue-card">
          <span>Активных товаров</span>
          <strong>{inventoryProducts.length || "—"}</strong>
        </div>

        <div className="admin-revenue-card">
          <span>Активных складов</span>
          <strong>{inventoryWarehouses.length || "—"}</strong>
        </div>
      </div>

      <div className="admin-filters">
        <input
'''

if needle not in text:
    raise SystemExit("Не найден блок admin-filters")

text = text.replace(needle, replacement, 1)

# ------------------------------------------------------------
# 4. Добавляем modal прихода перед selectedOrder modal
# ------------------------------------------------------------

needle = '''      {selectedOrder && (
        <div
          className="admin-order-overlay"
'''

replacement = '''      {inventoryOpen && (
        <div
          className="admin-order-overlay"
          onClick={closeInventory}
        >
          <div
            className="admin-order-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="admin-close"
              onClick={closeInventory}
              disabled={inventorySaving}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <p className="eyebrow">WAREHOUSE</p>
            <h2>Приход товара</h2>
            <p>
              Добавление новой партии в складской остаток.
            </p>

            {inventoryLoading ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">⏳</div>
                <h2>Загрузка...</h2>
                <p>Получаем товары, склады и поставщиков.</p>
              </div>
            ) : (
              <form onSubmit={submitInventoryReceipt}>
                <div className="admin-status-control">
                  <span>Товар</span>

                  <select
                    value={inventoryForm.productId}
                    onChange={(event) =>
                      setInventoryForm((current) => ({
                        ...current,
                        productId: event.target.value,
                      }))
                    }
                    required
                    disabled={inventorySaving}
                  >
                    <option value="">
                      Выберите товар
                    </option>

                    {inventoryProducts.map((product) => {
                      const translation =
                        product.translations?.find(
                          (item) => item.locale === "RU"
                        ) ||
                        product.translations?.[0];

                      const brand =
                        product.brand?.translations?.find(
                          (item) => item.locale === "RU"
                        ) ||
                        product.brand?.translations?.[0];

                      return (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {brand?.name
                            ? `${brand.name} — `
                            : ""}
                          {translation?.name ||
                            product.sku}
                          {" · "}
                          {product.sku}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="admin-status-control">
                  <span>Склад</span>

                  <select
                    value={inventoryForm.warehouseId}
                    onChange={(event) =>
                      setInventoryForm((current) => ({
                        ...current,
                        warehouseId: event.target.value,
                      }))
                    }
                    required
                    disabled={inventorySaving}
                  >
                    <option value="">
                      Выберите склад
                    </option>

                    {inventoryWarehouses.map((warehouse) => (
                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.name}
                        {warehouse.city
                          ? ` — ${warehouse.city}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-status-control">
                  <span>Количество</span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={inventoryForm.quantity}
                    onChange={(event) =>
                      setInventoryForm((current) => ({
                        ...current,
                        quantity: event.target.value,
                      }))
                    }
                    placeholder="Например, 20"
                    required
                    disabled={inventorySaving}
                  />
                </div>

                <div className="admin-status-control">
                  <span>Закупочная цена, сум</span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={inventoryForm.costPrice}
                    onChange={(event) =>
                      setInventoryForm((current) => ({
                        ...current,
                        costPrice: event.target.value,
                      }))
                    }
                    placeholder="Например, 85000"
                    required
                    disabled={inventorySaving}
                  />
                </div>

                <div className="admin-status-control">
                  <span>Номер партии</span>

                  <input
                    type="text"
                    value={inventoryForm.batchNumber}
                    onChange={(event) =>
                      setInventoryForm((current) => ({
                        ...current,
                        batchNumber: event.target.value,
                      }))
                    }
                    placeholder="Необязательно"
                    disabled={inventorySaving}
                  />
                </div>

                <div className="admin-status-control">
                  <span>Срок годности</span>

                  <input
                    type="date"
                    value={inventoryForm.expirationDate}
                    onChange={(event) =>
                      setInventoryForm((current) => ({
                        ...current,
                        expirationDate: event.target.value,
                      }))
                    }
                    disabled={inventorySaving}
                  />
                </div>

                <div className="admin-status-control">
                  <span>Поставщик</span>

                  <select
                    value={inventoryForm.supplierId}
                    onChange={(event) =>
                      setInventoryForm((current) => ({
                        ...current,
                        supplierId: event.target.value,
                      }))
                    }
                    disabled={inventorySaving}
                  >
                    <option value="">
                      Без указания поставщика
                    </option>

                    {inventorySuppliers.map((supplier) => (
                      <option
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
                        {supplier.country
                          ? ` — ${supplier.country}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-comment">
                  <span>Комментарий</span>

                  <textarea
                    value={inventoryForm.reason}
                    onChange={(event) =>
                      setInventoryForm((current) => ({
                        ...current,
                        reason: event.target.value,
                      }))
                    }
                    placeholder="Например: поставка от 18.09.2026"
                    rows={3}
                    disabled={inventorySaving}
                  />
                </div>

                {inventoryError && (
                  <div className="admin-empty">
                    <div className="admin-empty-icon">⚠️</div>
                    <p>{inventoryError}</p>
                  </div>
                )}

                {inventorySuccess && (
                  <div className="admin-empty">
                    <div className="admin-empty-icon">✅</div>
                    <p>{inventorySuccess}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="admin-export"
                  disabled={inventorySaving}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                  }}
                >
                  {inventorySaving
                    ? "Оформляем приход..."
                    : "Принять товар"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {selectedOrder && (
        <div
          className="admin-order-overlay"
'''

if needle not in text:
    raise SystemExit("Не найден selectedOrder modal")

text = text.replace(needle, replacement, 1)

path.write_text(text, encoding="utf-8")
print("AdminPanel.jsx обновлён")
