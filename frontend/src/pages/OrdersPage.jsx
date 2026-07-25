import { useEffect, useState } from 'react';

import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { pushToast } = useToast();
  const reloadOrders = async (pageNumber = page) => {
  const response = await api.get(
    `/api/orders/?page=${pageNumber}&page_size=5`
  );

  setOrders(response.data.results || []);

  setTotalPages(
    Math.ceil(response.data.count / 5)
  );
};

  useEffect(() => {
  const loadOrders = async () => {
    try {
      await reloadOrders(page);
    } finally {
      setLoading(false);
    }
  };

  loadOrders().catch(() => {
    setLoading(false);

    pushToast({
      title: "Orders unavailable",
      description: "Could not load order history.",
      tone: "error",
    });
  });
}, [page]);
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-sand-200">Order history</p>
        <h1 className="title-font mt-3 text-4xl font-bold text-white">Track placed, confirmed, and cancelled orders</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Customers see their own orders here, while admins can review the full transaction stream.
        </p>
      </section>

      {loading ? (
        <div className="glass-panel rounded-[2rem] p-8 text-center text-slate-300">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="glass-panel rounded-[2rem] p-8 text-center text-slate-300">No orders found.</div>
      ) : ( 
        <>
        <div className="space-y-4">
          {orders.map((order) => (
            <details key={order.id} className="glass-panel rounded-[2rem] p-5">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <div>
  <p className="title-font text-xl font-semibold text-white">
    Order #{order.id}
  </p>

  <p className="text-sm text-slate-400">
    {order.customer || "Customer order"}
  </p>

  <p className="text-xs text-slate-500">
    {new Date(order.created_at).toLocaleString()}
  </p>
</div>
                <div className="flex items-center gap-3">

  <span className="rounded-full bg-accent-500/15 px-3 py-1 text-sm font-semibold text-accent-100">
    {order.status}
  </span>

  <span className="text-lg font-semibold text-sand-200">
    ${Number(order.total_amount).toFixed(2)}
  </span>

  {order.status === "pending" && (
  <>
    <button
      onClick={async (e) => {
        e.preventDefault();

        try {
          await api.patch(`/api/orders/${order.id}/`, {
            status: "completed",
          });

          await reloadOrders();

          pushToast({
            title: "Order completed",
            tone: "success",
          });
        } catch {
          pushToast({
            title: "Unable to complete order",
            tone: "error",
          });
        }
      }}
      className="rounded-lg bg-green-600 px-3 py-2 text-white"
    >
      Complete
    </button>

    <button
      onClick={async (e) => {
        e.preventDefault();

        if (!window.confirm("Cancel this order?")) return;

        try {
          await api.post(`/api/orders/${order.id}/cancel/`);

          await reloadOrders();

          pushToast({
            title: "Order cancelled",
            tone: "success",
          });
        } catch {
          pushToast({
            title: "Unable to cancel order",
            tone: "error",
          });
        }
      }}
      className="rounded-lg bg-red-600 px-3 py-2 text-white"
    >
      Cancel
    </button>
  </>
)}

</div>
              </summary>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
  {order.items && order.items.length > 0 ? (
    order.items.map((item) => (
      <div
        key={item.id}
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <p className="font-semibold text-white">
          {item.product_name}
        </p>

        <p className="text-sm text-slate-400">
          SKU {item.product_sku}
        </p>

        <p className="mt-2 text-sm text-slate-300">
          {item.quantity} × $
          {Number(item.unit_price).toFixed(2)}
          {" = $"}
          {Number(item.line_total).toFixed(2)}
        </p>
      </div>
    ))
  ) : (
    <p className="text-slate-400">
      No products found in this order.
    </p>
  )}
</div>
            </details>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-4">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="rounded-lg border border-white/10 px-4 py-2 text-white disabled:opacity-40"
  >
    Previous
  </button>

  <span className="text-slate-300">
    Page {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="rounded-lg border border-white/10 px-4 py-2 text-white disabled:opacity-40"
  >
    Next
  </button>
</div>

      </>
      )}
    </div>
  );
}