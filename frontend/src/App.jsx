import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ToastViewport from './components/ToastViewport';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import NotFoundPage from './pages/NotFoundPage';

function DefaultRedirect() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Navigate to={user.role === 'admin' ? '/dashboard' : '/products'} replace />;
}

export default function App() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-grid text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl border border-white/20 bg-white/10 shadow-glow" />
          <p className="text-sm uppercase tracking-[0.35em] text-white/60">Loading Inventory Flow</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <DefaultRedirect /> : <LoginPage />} />
        <Route path="/register" element={user ? <DefaultRedirect /> : <RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<DefaultRedirect />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="products"
            element={
              <ProtectedRoute roles={['admin', 'staff']}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute roles={['admin', 'staff']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <ToastViewport />
    </>
  );
}