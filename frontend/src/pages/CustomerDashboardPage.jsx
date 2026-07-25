import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function CustomerDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get('/api/dashboard/customer/');
        setDashboard(response.data);
      } catch (error) {
        pushToast({
          title: 'Dashboard unavailable',
          description: 'Could not load your dashboard.',
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

  // Prepare order status data for bar chart
  const orderStatusData = [
    { status: 'Total Orders', count: dashboard.total_orders },
    { status: 'Pending', count: dashboard.pending_orders },
    { status: 'Completed', count: dashboard.completed_orders },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-sand-200">Your Dashboard</p>
        <h1 className="title-font mt-3 text-4xl font-bold text-white">Order History & Summary</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Track your orders, spending, and fulfillment status in one place.
        </p>
      </section>

      {/* Key Metrics */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={dashboard.total_orders} caption="Orders placed" accent />
        <StatCard label="Pending" value={dashboard.pending_orders} caption="Awaiting fulfillment" />
        <StatCard label="Completed" value={dashboard.completed_orders} caption="Successfully delivered" />
        <StatCard
          label="Total Spent"
          value={`$${Number(dashboard.total_spent).toFixed(2)}`}
          caption="Lifetime spending"
          accent
        />
      </section>

      {/* Chart and Recent Orders */}
      <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Order Status Chart */}
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="title-font text-xl font-semibold text-white">Order Status Overview</p>
          <p className="mt-1 text-sm text-slate-400">Distribution by status</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="status" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(16,27,38,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#18b06e" name="Orders" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="title-font text-xl font-semibold text-white">Recent Orders</p>
          <p className="mt-1 text-sm text-slate-400">Your latest transactions</p>
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {dashboard.recent_orders && dashboard.recent_orders.length > 0 ? (
              dashboard.recent_orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">Order #{order.id}</p>
                      <p className="text-sm text-slate-400">
                        {new Date(order.created_at).toLocaleDateString()} · {order.items_count} item(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:justify-end">
                      <p className="text-lg font-semibold text-sand-200">${Number(order.total_amount).toFixed(2)}</p>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                          order.status === 'completed'
                            ? 'bg-accent-500/15 text-accent-100'
                            : order.status === 'pending'
                              ? 'bg-yellow-500/15 text-yellow-100'
                              : order.status === 'confirmed'
                                ? 'bg-blue-500/15 text-blue-100'
                                : 'bg-red-500/15 text-red-100'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-400">No orders yet. Start shopping!</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
