import AdminDashboardPage from './AdminDashboardPage';
import CustomerDashboardPage from './CustomerDashboardPage';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  // Route to role-specific dashboard
  if (isAdmin) {
    return <AdminDashboardPage />;
  }

  return <CustomerDashboardPage />;
}