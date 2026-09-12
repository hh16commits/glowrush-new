import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const ORDER_STATUSES = [
  { id: "new", label: "Новый" },
  { id: "confirmed", label: "Подтверждён" },
  { id: "packed", label: "Собран" },
  { id: "delivery", label: "Доставляется" },
  { id: "completed", label: "Завершён" },
  { id: "cancelled", label: "Отменён" },
];

function AdminPanel({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setOrdersLoading(true);
      setOrdersError("");

      try {
        const { data, error } = await supabase
          .from("Order")
          .select(`
            id,
            orderNumber,
            guestName,
            guestPhone,
            status,
            subtotal,
            deliveryFee,
            giftWrapFee,
            discountAmount,
            totalAmount,
            notes,
            createdAt,
            items:OrderItem (
              id,
              quantity,
              unitPrice,
              totalPrice,
              product:Product (
                id,
                sku,
                brand:Brand (
                  translations:BrandTranslation (
                    name,
                    locale
                  )
                ),
                translations:ProductTranslation (
                  name,
                  locale
                ),
                images:ProductImage (
                  url,
                  isPrimary
                )
              )
            ),
            delivery:Delivery (
              id,
              provider,
              status
            )
          `)
          .order("createdAt", { ascending: false });

        if (error) throw error;

        const mappedOrders = (data || []).map((order) => ({
          id: order.id,
          number: order.orderNumber,
          createdAt: order.createdAt,
          total: order.totalAmount || 0,
          subtotal: order.subtotal || 0,
          deliveryFee: order.deliveryFee || 0,
          customer: {
            name: order.guestName || "Без имени",
            phone: order.guestPhone || "",
            city: "",
            comment: order.notes || "",
          },
          delivery: {
            name:
              order.delivery?.[0]?.provider === "MANUAL"
                ? "Курьер"
                : "Доставка",
          },
          dbStatus: order.status,
          items: (order.items || []).map((item) => {
            const ruTranslation =
              item.product?.translations?.find(
                (translation) => translation.locale === "RU"
              );

            const translation =
              ruTranslation ||
              item.product?.translations?.[0];

            const primaryImage =
              item.product?.images?.find(
                (image) => image.isPrimary
              ) ||
              item.product?.images?.[0];

            return {
              id: item.id,
              name: translation?.name || item.product?.sku || "Товар",
              brand:
                item.product?.brand?.translations?.find(
                  (translation) => translation.locale === "RU"
                )?.name ||
                item.product?.brand?.translations?.[0]?.name ||
                "",
              image: primaryImage?.url || "",
              quantity: item.quantity || 1,
              price: item.unitPrice || 0,
            };
          }),
        }));

        if (!cancelled) {
          setOrders(mappedOrders);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);

        if (!cancelled) {
          setOrdersError(
            error?.message || "Не удалось загрузить заказы"
          );
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatItemsCount = (count) => {
    const lastTwo = count % 100;
    const lastOne = count % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return `${count} товаров`;
    if (lastOne === 1) return `${count} товар`;
    if (lastOne >= 2 && lastOne <= 4) return `${count} товара`;
    return `${count} товаров`;
  };

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");


  const formatPrice = (price) =>
    `${Number(price || 0).toLocaleString("ru-RU")} сум`;

  const dbStatusToAdminStatus = {
    PENDING: "new",
    AWAITING_PAYMENT: "new",
    PAYMENT_PROOF_SUBMITTED: "new",
    PAID: "confirmed",
    CONFIRMED: "confirmed",
    PICKING: "packed",
    PACKING: "packed",
    READY_FOR_DELIVERY: "delivery",
    COURIER_ASSIGNED: "delivery",
    IN_TRANSIT: "delivery",
    DELIVERED: "completed",
    CANCELLED: "cancelled",
    REFUND_REQUESTED: "cancelled",
    REFUNDED: "cancelled",
  };

  const adminStatusToDbStatus = {
    new: "PENDING",
    confirmed: "CONFIRMED",
    packed: "PACKING",
    delivery: "IN_TRANSIT",
    completed: "DELIVERED",
    cancelled: "CANCELLED",
  };

  const getStatus = (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    return dbStatusToAdminStatus[order?.dbStatus] || "new";
  };

  const getStatusLabel = (orderId) =>
    ORDER_STATUSES.find(
      (status) => status.id === getStatus(orderId)
    )?.label || "Новый";

  const changeStatus = async (orderId, status) => {
    const dbStatus = adminStatusToDbStatus[status];

    if (!dbStatus) return;

    const order = orders.find((item) => item.id === orderId);

    if (!order) return;

    const fromStatus = order.dbStatus || "PENDING";

    if (fromStatus === dbStatus) return;

    const { error: updateError } = await supabase
      .from("Order")
      .update({ status: dbStatus })
      .eq("id", orderId);

    if (updateError) {
      console.error(
        "Failed to update order status:",
        updateError
      );
      alert("Не удалось изменить статус заказа.");
      return;
    }

    const { error: historyError } = await supabase
      .from("OrderStatusHistory")
      .insert({
        id: crypto.randomUUID(),
        orderId,
        fromStatus,
        toStatus: dbStatus,
        note: "Статус изменён администратором",
      });

    if (historyError) {
      console.error(
        "Failed to save order status history:",
        historyError
      );

      alert(
        "Статус заказа изменён, но история не сохранилась."
      );
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, dbStatus }
          : order
      )
    );

    setSelectedOrder((current) =>
      current?.id === orderId
        ? { ...current, dbStatus }
        : current
    );
  };

  const exportOrders = () => {
    const ordersToExport =
      statusFilter === "all"
        ? orders
        : orders.filter(
            (order) => getStatus(order.id) === statusFilter
          );

    if (!ordersToExport.length) return;

    const headers = [
      "Номер заказа",
      "Дата",
      "Клиент",
      "Телефон",
      "Город",
      "Доставка",
      "Статус",
      "Товары",
      "Сумма",
    ];

    const rows = ordersToExport.map((order) => {
      const items = (order.items || [])
        .map(
          (item) =>
            `${item.name} x${item.quantity || 1}`
        )
        .join("; ");

      const date = order.createdAt
        ? new Date(order.createdAt).toLocaleString("ru-RU")
        : "";

      return [
        order.number || "",
        date,
        order.customer?.name || "",
        order.customer?.phone || "",
        order.customer?.city || "",
        order.delivery?.name || "",
        getStatusLabel(order.id),
        items,
        order.total || 0,
      ];
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(";")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `glowrush-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const normalizedSearch = search.toLowerCase().trim();

  const statusCounts = ORDER_STATUSES.reduce(
    (counts, status) => {
      counts[status.id] = orders.filter(
        (order) =>
          getStatus(order.id) === status.id
      ).length;

      return counts;
    },
    {}
  );

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  const completedRevenue = orders
    .filter(
      (order) => getStatus(order.id) === "completed"
    )
    .reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

  const deliveryRevenue = orders
    .filter(
      (order) => getStatus(order.id) === "delivery"
    )
    .reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

  const newRevenue = orders
    .filter(
      (order) => getStatus(order.id) === "new"
    )
    .reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

  const today = new Date();

  const todayOrders = orders.filter((order) => {
    if (!order.createdAt) return false;

    const orderDate = new Date(order.createdAt);

    return (
      orderDate.getFullYear() === today.getFullYear() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getDate() === today.getDate()
    );
  });

  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  const filteredOrders = [...orders]
    .filter((order) => {
      const currentStatus = getStatus(order.id);

      const matchesStatus =
        statusFilter === "all" ||
        currentStatus === statusFilter;

      const name =
        order.customer?.name?.toLowerCase() || "";

      const phone =
        order.customer?.phone?.toLowerCase() || "";

      const number =
        order.number?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        number.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateB - dateA;
    });

  return (
    <section className="admin-panel">
      <div className="admin-header">
        <div>
          <p className="eyebrow">GLOWRUSH ADMIN</p>
          <h1>Заказы</h1>
          <p>Управление заказами магазина</p>
        </div>

        <div className="admin-header-actions">
          <div className="admin-stat">
            <span>Всего заказов</span>
            <strong>{orders.length}</strong>
          </div>

          <div className="admin-header-buttons">
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
              onClick={onLogout}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="admin-revenue-cards">
        <div className="admin-revenue-card admin-revenue-main">
          <span>Общая выручка</span>
          <strong>{formatPrice(totalRevenue)}</strong>
        </div>

        <div className="admin-revenue-card">
          <span>Завершено</span>
          <strong>{formatPrice(completedRevenue)}</strong>
        </div>

        <div className="admin-revenue-card">
          <span>В доставке</span>
          <strong>{formatPrice(deliveryRevenue)}</strong>
        </div>

        <div className="admin-revenue-card">
          <span>Новые</span>
          <strong>{formatPrice(newRevenue)}</strong>
        </div>
      </div>

      <div className="admin-today-card">
        <div>
          <span>Сегодня</span>
          <strong>{todayOrders.length} заказ(ов)</strong>
        </div>

        <div>
          <span>Продажи за сегодня</span>
          <strong>{formatPrice(todayRevenue)}</strong>
        </div>
      </div>

      <div className="admin-status-cards">
        {ORDER_STATUSES.map((status) => (
          <button
            type="button"
            key={status.id}
            className={`admin-status-card ${
              statusFilter === status.id
                ? "admin-status-card-active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter((current) =>
                current === status.id
                  ? "all"
                  : status.id
              )
            }
          >
            <span>{status.label}</span>
            <strong>{statusCounts[status.id]}</strong>
          </button>
        ))}
      </div>

      <div className="admin-filters">
        <input
          type="search"
          placeholder="Поиск по заказу, имени или телефону"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">Все статусы</option>

          {ORDER_STATUSES.map((status) => (
            <option
              key={status.id}
              value={status.id}
            >
              {status.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="admin-reset"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
          }}
        >
          Сбросить
        </button>
      </div>

      {ordersLoading ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">⏳</div>
          <h2>Загрузка заказов...</h2>
          <p>Получаем заказы из Supabase.</p>
        </div>
      ) : ordersError ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">⚠️</div>
          <h2>Ошибка загрузки заказов</h2>
          <p>{ordersError}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">🔎</div>
          <h2>Заказы не найдены</h2>
          <p>
            Попробуйте изменить поиск или фильтр.
          </p>
        </div>
      ) : (
        <div className="admin-orders">
          {filteredOrders.map((order) => (
            <button
              type="button"
              className="admin-order"
              key={order.id}
              onClick={() =>
                setSelectedOrder(order)
              }
            >
              <div>
                <span className="admin-order-number">
                  {order.number}
                </span>

                <strong>
                  {order.customer?.name ||
                    "Без имени"}
                </strong>

                <small>
                  {order.customer?.phone ||
                    "Телефон не указан"}
                </small>

                <small className="admin-order-meta">
                  {formatItemsCount(
                    order.items?.reduce(
                      (sum, item) =>
                        sum + (item.quantity || 1),
                      0
                    ) || 0
                  )}{" "}
                  ·{" "}
                  {order.createdAt
                    ? new Date(
                        order.createdAt
                      ).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Заказ создан ранее"}
                </small>

                <span
                  className={`admin-status admin-status-${getStatus(
                    order.id
                  )}`}
                >
                  {getStatusLabel(order.id)}
                </span>
              </div>

              <div className="admin-order-right">
                <strong>
                  {formatPrice(order.total)}
                </strong>

                <span>
                  {order.delivery?.name ||
                    "Доставка"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div
          className="admin-order-overlay"
          onClick={() =>
            setSelectedOrder(null)
          }
        >
          <div
            className="admin-order-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="admin-close"
              onClick={() =>
                setSelectedOrder(null)
              }
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

            <p className="eyebrow">ORDER DETAILS</p>
            <h2>{selectedOrder.number}</h2>

            <div className="admin-status-control">
              <span>Статус заказа</span>

              <select
                value={getStatus(
                  selectedOrder.id
                )}
                onChange={(event) =>
                  changeStatus(
                    selectedOrder.id,
                    event.target.value
                  )
                }
              >
                {ORDER_STATUSES.map((status) => (
                  <option
                    key={status.id}
                    value={status.id}
                  >
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-customer">
              <div>
                <span>Клиент</span>
                <strong>
                  {selectedOrder.customer?.name}
                </strong>
              </div>

              <div>
                <span>Телефон</span>
                <strong>
                  {selectedOrder.customer?.phone}
                </strong>

                {selectedOrder.customer?.phone && (
                  <div className="admin-contact-actions">
                    <a
                      href={`tel:${selectedOrder.customer.phone}`}
                      className="admin-contact-button"
                    >
                      Позвонить
                    </a>

                    <a
                      href={`https://wa.me/${selectedOrder.customer.phone.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-contact-button"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}
              </div>

              <div>
                <span>Город</span>
                <strong>
                  {selectedOrder.customer?.city}
                </strong>
              </div>

              <div>
                <span>Доставка</span>
                <strong>
                  {selectedOrder.delivery?.name}
                </strong>
              </div>
            </div>

            <div className="admin-order-items">
              <h3>Товары</h3>

              {selectedOrder.items?.map((item) => (
                <div
                  className="admin-order-item"
                  key={item.id}
                >
                  <img
                    src={item.image}
                    alt=""
                  />

                  <div>
                    <span>{item.brand}</span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.quantity} шт.
                    </small>
                  </div>

                  <b>
                    {formatPrice(
                      item.price * item.quantity
                    )}
                  </b>
                </div>
              ))}
            </div>

            <div className="admin-total">
              <span>Итого</span>

              <strong>
                {formatPrice(
                  selectedOrder.total
                )}
              </strong>
            </div>

            {selectedOrder.customer?.comment && (
              <div className="admin-comment">
                <span>
                  Комментарий клиента
                </span>

                <p>
                  {selectedOrder.customer.comment}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminPanel;

