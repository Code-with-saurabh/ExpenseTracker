import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiPause, FiPlay, FiRepeat } from 'react-icons/fi';
import { fetchRecurring, createRecurring, deleteRecurring, toggleRecurring } from '../features/recurringSlice';
import { fetchCategories } from '../features/categorySlice';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { formatDate, formatDateInput, formatCurrency } from '../utils/format';
import { sanitizeAmountInput } from '../utils/amount';
import { PAYMENT_METHODS, FREQUENCIES } from '../utils/constants';

const emptyForm = {
  title: '',
  amount: '',
  category: '',
  frequency: 'monthly',
  nextDate: formatDateInput(new Date()),
  paymentMethod: 'upi',
};

const Recurring = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.recurring);
  const categories = useSelector((state) => state.categories.items);
  const { user } = useSelector((state) => state.auth);
  const currency = user ? user.currency : 'INR';

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const expenseCategories = categories.filter((item) => item.type === 'expense');

  useEffect(() => {
    dispatch(fetchRecurring());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const result = await dispatch(
      createRecurring({
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        frequency: form.frequency,
        nextDate: form.nextDate,
        paymentMethod: form.paymentMethod,
      })
    );

    setSaving(false);

    if (result.error) {
      toast.error(result.payload);
      return;
    }

    toast.success('Recurring expense created');
    setModalOpen(false);
    setForm(emptyForm);
  };

  const handleToggle = (id) => {
    dispatch(toggleRecurring(id));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring expense?')) return;
    const result = await dispatch(deleteRecurring(id));
    if (result.error) toast.error(result.payload);
    else toast.success('Recurring expense deleted');
  };

  const active = items.filter((item) => item.active);
  const paused = items.filter((item) => !item.active);

  const renderCard = (item) => (
    <div key={item._id} className={`card card-hover p-5 ${item.active ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage">
            {item.category ? item.category.icon : '🔁'}
          </div>
          <div>
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-[11px] text-muted">
              {FREQUENCIES.find((freq) => freq.value === item.frequency)?.label} · next {formatDate(item.nextDate)}
            </p>
          </div>
        </div>
        <span className={`chip ${item.active ? '' : 'opacity-70'}`}>{item.active ? 'Active' : 'Paused'}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <div>
          <p className="text-lg font-semibold">{formatCurrency(item.amount, currency)}</p>
          <p className="text-[11px] uppercase text-muted">
            {(PAYMENT_METHODS.find((method) => method.value === item.paymentMethod) || {}).label}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handleToggle(item._id)}
            className="rounded-lg p-2 text-muted transition hover:bg-sage hover:text-ink"
            title={item.active ? 'Pause' : 'Resume'}
          >
            {item.active ? <FiPause size={14} /> : <FiPlay size={14} />}
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted">Auto-posted when due</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Recurring expenses</h2>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <FiPlus size={15} /> Add recurring
        </button>
      </div>

      <div className="card flex items-center gap-3 border-l-4 border-l-accent px-4 py-3 text-xs text-muted">
        <FiRepeat size={15} className="text-accent" />
        Due expenses are posted to your transactions automatically whenever you open the dashboard.
      </div>

      {loading ? (
        <Loader label="Loading recurring expenses" />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No recurring expenses"
            message="Add subscriptions, rent or bills that repeat every month."
            actionLabel="Add your first recurring expense"
            onAction={() => setModalOpen(true)}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <p className="section-title mb-3">Active ({active.length})</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{active.map(renderCard)}</div>
            </div>
          )}
          {paused.length > 0 && (
            <div>
              <p className="section-title mb-3">Paused ({paused.length})</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{paused.map(renderCard)}</div>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} title="Add recurring expense" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              className="input"
              placeholder="Netflix"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className="input"
                placeholder="0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: sanitizeAmountInput(event.target.value) })}
                required
              />
            </div>
            <div>
              <label className="label">Next date</label>
              <input
                type="date"
                className="input"
                value={form.nextDate}
                onChange={(event) => setForm({ ...form, nextDate: event.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
              <option value="">Select category</option>
              {expenseCategories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.icon} {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Frequency</label>
              <select className="input" value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })}>
                {FREQUENCIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Payment method</label>
              <select
                className="input"
                value={form.paymentMethod}
                onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
              >
                {PAYMENT_METHODS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="divider" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Recurring;
