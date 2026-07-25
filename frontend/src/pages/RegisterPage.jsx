import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthHero from '@/components/AuthHero';
import FormField from '@/components/FormField';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '' });
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
      await register(form);
      pushToast({ title: 'Account created', description: 'You are now signed in.' });
      navigate('/products', { replace: true });
    } catch (error) {
      const response = error.response?.data || {};
      setErrors(response);
      pushToast({ title: 'Registration failed', description: 'Check the highlighted fields.', tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen gap-8 px-4 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
      <AuthHero
        eyebrow="Create access"
        title="Open a customer account and start placing orders."
        description="Registration creates a customer profile with the existing backend module. Admin accounts are managed separately."
      />

      <div className="flex items-center">
        <form onSubmit={handleSubmit} className="glass-panel w-full rounded-[2rem] p-6 sm:p-8">
          <p className="title-font text-3xl font-semibold text-white">Create account</p>
          <p className="mt-2 text-sm text-slate-400">Admins are created from Django admin. Customers sign up here.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FormField label="Username" name="username" value={form.username} onChange={handleChange} required />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <FormField label="First name" name="first_name" value={form.first_name} onChange={handleChange} />
            <FormField label="Last name" name="last_name" value={form.last_name} onChange={handleChange} />
            <div className="sm:col-span-2">
              <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
            {Object.keys(errors).length > 0 && (
              <div className="sm:col-span-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                Check the fields above and try again.
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="sm:col-span-2 w-full rounded-2xl bg-accent-500 px-4 py-3 font-semibold text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sand-200 hover:text-sand-100">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}