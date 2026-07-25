import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const COLORS = ['#18b06e', '#f79212', '#d97706', '#8f4b0b'];

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get('/api/dashboard/admin/');
        setDashboard(response.data);
      } catch (error) {
        pushToast({
          title: 'Dashboard unavailable',
          description: 'Could not load admin dashboard.',
          tone: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [pushToast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="glass-panel rounded-[2rem] p-6 sm:p-8 animate-pulse">
          <div className="h-4 bg-white/20 rounded w-1/4 mb-4" />
          <div className="h-8 bg-white/20 rounded w-3/4" />
        </section>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="glass-panel rounded-[2rem] p-8 text-center text-slate-300">
        Dashboard data unavailable.
      </div>
    );
  }

  // Prepare order status data for pie chart
  const statusData = Object.entries(dashboard.orders_by_status || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-sand-200">Admin Dashboard</p>
        <h1 className="title-font mt-3 text-4xl font-bold text-white">System Health & Analytics</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Real-time inventory, order, and revenue insights with actionable alerts.
        </p>
      </section>

      {/* Key Metrics */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Products" value={dashboard.total_products} caption="Active catalog items" accent />
        <StatCard label="Categories" value={dashboard.total_categories} caption="Catalog groupings" />
        <StatCard label="Orders" value={dashboard.total_orders} caption="Placed orders" />
        <StatCard
  label="Revenue"
  value={`$${Number(dashboard.total_revenue).toFixed(2)}`}
  caption="Total system revenue"
  accent
/>
        <StatCard label="Low Stock" value={dashboard.low_stock_count} caption="Items ≤ 5 units" />
        <StatCard label="Pending" value={dashboard.pending_orders_count} caption="Orders awaiting action" />
      </section>

      {/* Charts Row 1: Revenue & Order Status */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="title-font text-xl font-semibold text-white">Monthly Revenue Trend</p>
          <p className="mt-1 text-sm text-slate-400">Cumulative revenue over time</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.revenue_by_month || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(16,27,38,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#18b06e"
                  strokeWidth={2}
                  dot={{ fill: '#18b06e', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="title-font text-xl font-semibold text-white">Order Status Distribution</p>
          <p className="mt-1 text-sm text-slate-400">Breakdown by order status</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(16,27,38,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Low Stock & Recent Orders Row */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="title-font text-xl font-semibold text-white">Low Stock Alerts</p>
          <p className="mt-1 text-sm text-slate-400">Items at or below threshold</p>
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {dashboard.low_stock_products && dashboard.low_stock_products.length > 0 ? (
              dashboard.low_stock_products.map((product) => (
                <div key={product.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                      <p className="mt-1 text-sm text-slate-300">{product.category_name}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          product.stock_quantity <= 2 ? 'text-red-300' : 'text-yellow-300'
                        }`}
                      >
                        {product.stock_quantity} units
                      </p>
                      <p className="text-xs text-sand-200">${Number(product.price).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5 text-center">
  <p className="text-lg font-semibold text-green-300">
    ✓ All products have sufficient stock
  </p>

  <p className="mt-2 text-sm text-slate-300">
    No products require restocking.
  </p>
</div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="title-font text-xl font-semibold text-white">Recent Orders</p>
          <p className="mt-1 text-sm text-slate-400">Latest transaction activity</p>
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {dashboard.recent_orders && dashboard.recent_orders.length > 0 ? (
              dashboard.recent_orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-white">Order #{order.id}</p>
                      <p className="text-xs text-slate-400">{order.user_username}</p>
                      <p className="mt-1 text-sm text-slate-300">{order.items_count} item(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-sand-200">${Number(order.total_amount).toFixed(2)}</p>
                      <p
                        className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          order.status === 'completed'
                            ? 'bg-accent-500/15 text-accent-100'
                            : order.status === 'pending'
                              ? 'bg-yellow-500/15 text-yellow-100'
                              : 'bg-red-500/15 text-red-100'
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No recent orders.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
