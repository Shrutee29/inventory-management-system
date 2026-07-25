import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AuthHero from '@/components/AuthHero';
import FormField from '@/components/FormField';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const user = await login(form);
      const fallbackPath = user.role === 'admin' ? '/dashboard' : '/products';
      const target = location.state?.from?.pathname || fallbackPath;
      navigate(target, { replace: true });
    } catch (error) {
      const detail = error.response?.data?.detail || 'Unable to sign in.';
      setErrors({ form: detail });
      pushToast({ title: 'Login failed', description: detail, tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen gap-8 px-4 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
      <AuthHero
        eyebrow="Secure access"
        title="Run inventory and orders from one precise workspace."
        description="Sign in to manage stock, browse products, place orders, and keep the entire fulfillment flow in sync."
      />

      <div className="flex items-center">
        <form onSubmit={handleSubmit} className="glass-panel w-full rounded-[2rem] p-6 sm:p-8">
          <p className="title-font text-3xl font-semibold text-white">Sign in</p>
          <p className="mt-2 text-sm text-slate-400">Use your existing account credentials.</p>

          <div className="mt-6 space-y-5">
            <FormField label="Username" name="username" value={form.username} onChange={handleChange} autoComplete="username" required />
            <FormField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            {errors.form && <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errors.form}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-accent-500 px-4 py-3 font-semibold text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-sand-200 hover:text-sand-100">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}