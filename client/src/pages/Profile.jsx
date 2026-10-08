import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import { updateProfile } from '../features/authSlice';
import { setTheme } from '../features/themeSlice';
import { themes } from '../themes';
import { initials } from '../utils/format';
import { sanitizeAmountInput } from '../utils/amount';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const themeId = useSelector((state) => state.theme.themeId);

  const [form, setForm] = useState({ name: '', currency: 'INR', monthlyIncome: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        currency: user.currency || 'INR',
        monthlyIncome: user.monthlyIncome || 0,
      });
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const result = await dispatch(
      updateProfile({
        name: form.name,
        currency: form.currency,
        monthlyIncome: Number(form.monthlyIncome),
      })
    );

    setSaving(false);

    if (result.error) {
      toast.error(result.payload);
      return;
    }

    toast.success('Profile updated');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted">Your account</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Profile</h2>
      </div>

      <div className="card flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-onprimary">
          {initials(user.name)}
        </div>
        <div>
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-muted">{user.email}</p>
          <p className="mt-1 text-[11px] text-muted">
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4">
          <p className="section-title">Appearance</p>
          <p className="mt-1 text-[11px] text-muted">Pick a theme — it applies instantly and is saved for next time.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => dispatch(setTheme(theme.id))}
              className={`card card-hover p-3 text-left transition duration-200 ${
                themeId === theme.id ? 'ring-2 ring-primary' : 'ring-1 ring-line'
              }`}
            >
              <div className="mb-2 flex gap-1.5">
                <span
                  className="h-5 w-5 rounded-full border"
                  style={{ backgroundColor: theme.light.bg, borderColor: theme.light.border }}
                />
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: theme.light.primary }} />
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: theme.light.accent }} />
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: theme.light.sage }} />
              </div>
              <p className="text-[10px] font-semibold leading-tight">{theme.name.replace(/^Option \d+ — /, '')}</p>
              {themeId === theme.id && <p className="mt-1 text-[10px] text-accent">Selected</p>}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <p className="section-title">Account settings</p>

        <div>
          <label className="label">Name</label>
          <input type="text" className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Currency</label>
            <select className="input" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
          <div>
            <label className="label">Monthly income target</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              className="input"
              value={form.monthlyIncome}
              onChange={(event) => setForm({ ...form, monthlyIncome: sanitizeAmountInput(event.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <input type="email" className="input opacity-60" value={user.email} disabled />
        </div>

        <div className="divider" />
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            <FiCheck size={15} /> {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
