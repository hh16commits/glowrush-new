import { useEffect, useState } from "react";

const ORDER_STATUSES = [
  { id: "new", label: "Новый" },
  { id: "confirmed", label: "Подтверждён" },
  { id: "packed", label: "Собран" },
  { id: "delivery", label: "Доставляется" },
  { id: "completed", label: "Завершён" },
  { id: "cancelled", label: "Отменён" },
];

function AdminPanel({ orders = [], onLogout }) {
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

  const [statuses, setStatuses] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("glowrush-order-statuses")
      ) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "glowrush-order-statuses",
      JSON.stringify(statuses)
    );
  }, [statuses]);

  const formatPrice = (price) =>
    `${Number(price || 0).toLocaleString("ru-RU")} сум`;

  const getStatus = (orderId) =>
    statuses[orderId] || "new";

  const getStatusLabel = (orderId) =>
    ORDER_STATUSES.find(
      (status) => status.id === getStatus(orderId)
    )?.label || "Новый";

  const changeStatus = (orderId, status) => {
    setStatuses((current) => ({
      ...current,
      [orderId]: status,
    }));
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

      {filteredOrders.length === 0 ? (
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
              ×
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
