import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiArrowRight } from 'react-icons/fi';
import { login, clearAuthError } from '../features/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(login(form));
    if (result.error) {
      toast.error(result.payload);
    } else {
      toast.success('Welcome back');
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-beige lg:block">
        <img
          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80"
          alt="Editorial desk with receipts"
          className="h-full w-full object-cover"
          onError={(event) => {
            event.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#29231F]/85 via-[#29231F]/25 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#E9EDE4]">ExpenseTracker</p>
          <h2 className="mt-3 max-w-md text-2xl font-semibold leading-snug text-[#FAF8F3]">
            Every rupee has a story.
            <br />
            Know yours.
          </h2>
          <div className="mt-5 h-px w-24 bg-[#E9EDE4]/50" />
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-[#FAF8F3]/75">
            Track spending, plan budgets and watch your savings goals grow — all in one calm place.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-onprimary">
            ET
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-xs text-muted">Sign in to continue tracking your expenses</p>

          <div className="mt-4 rounded-lg border border-line bg-sage px-4 py-3 text-[11px] leading-relaxed text-muted">
            Demo login: <span className="font-semibold text-ink">demo@example.com</span> /{' '}
            <span className="font-semibold text-ink">password123</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <FiArrowRight size={15} />}
            </button>
          </form>

          <p className="mt-6 text-xs text-muted">
            New here?{' '}
            <Link to="/register" className="font-semibold text-ink underline decoration-accent underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
