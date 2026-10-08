import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiArrowRight } from 'react-icons/fi';
import { register, clearAuthError } from '../features/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const result = await dispatch(register(form));
    if (result.error) {
      toast.error(result.payload);
    } else {
      toast.success('Account created');
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-onprimary">
            ET
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-xs text-muted">Start tracking your money in under a minute</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                name="name"
                className="input"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="label">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="input"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <FiArrowRight size={15} />}
            </button>
          </form>

          <p className="mt-6 text-xs text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-ink underline decoration-accent underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden w-1/2 overflow-hidden bg-beige lg:block">
        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80"
          alt="Editorial notebook and coffee"
          className="h-full w-full object-cover"
          onError={(event) => {
            event.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#29231F]/85 via-[#29231F]/25 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#E9EDE4]">ExpenseTracker</p>
          <h2 className="mt-3 max-w-md text-2xl font-semibold leading-snug text-[#FAF8F3]">
            Calm finances,
            <br />
            clear decisions.
          </h2>
          <div className="mt-5 h-px w-24 bg-[#E9EDE4]/50" />
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-[#FAF8F3]/75">
            Budgets that warn you early, reports that explain where your money really goes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
