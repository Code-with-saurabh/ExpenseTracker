import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { fetchBudgets, createBudget, updateBudget, deleteBudget } from '../features/budgetSlice';
import { fetchCategories } from '../features/categorySlice';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import ProgressBar from '../components/ProgressBar';
import { formatCurrency, monthName } from '../utils/format';
import { sanitizeAmountInput } from '../utils/amount';

const Budgets = () => {
  const dispatch = useDispatch();
  const { items, summary, loading } = useSelector((state) => state.budgets);
  const categories = useSelector((state) => state.categories.items);
  const { user } = useSelector((state) => state.auth);
  const currency = user ? user.currency : 'INR';

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: '', amount: '' });
  const [saving, setSaving] = useState(false);

  const expenseCategories = categories.filter((item) => item.type === 'expense');
  const usedCategoryIds = items.map((item) => (item.category ? item.category._id : ''));

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBudgets({ month, year }));
  }, [dispatch, month, year]);

  const openAdd = () => {
    setEditing(null);
    setForm({ category: '', amount: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ category: item.category._id, amount: item.budget });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    let result;
    if (editing) {
      result = await dispatch(updateBudget({ id: editing._id, data: { amount: Number(form.amount) } }));
    } else {
      result = await dispatch(createBudget({ category: form.category, amount: Number(form.amount), month, year }));
    }

    setSaving(false);

    if (result.error) {
      toast.error(result.payload);
      return;
    }

    toast.success(editing ? 'Budget updated' : 'Budget created');
    setModalOpen(false);
    dispatch(fetchBudgets({ month, year }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    const result = await dispatch(deleteBudget(id));
    if (result.error) toast.error(result.payload);
    else toast.success('Budget deleted');
  };

  const statusLabel = (percentage) => {
    if (percentage >= 100) return { text: 'Exceeded', color: 'text-red-600' };
    if (percentage >= 80) return { text: 'Near limit', color: 'text-amber-600' };
    return { text: 'On track', color: 'text-accent' };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted">Monthly limits</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              {monthName(month)} {year}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const date = new Date(year, month - 2, 1);
                setMonth(date.getMonth() + 1);
                setYear(date.getFullYear());
              }}
              className="btn-outline btn-sm"
            >
              ←
            </button>
            <button
              onClick={() => {
                const date = new Date(year, month, 1);
                setMonth(date.getMonth() + 1);
                setYear(date.getFullYear());
              }}
              className="btn-outline btn-sm"
            >
              →
            </button>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <FiPlus size={15} /> Add budget
        </button>
      </div>

      {summary && summary.totalBudget > 0 && (
        <div className="card bg-beige p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-title">Overall budget</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(summary.totalSpent, currency)}</p>
              <p className="text-xs text-muted">spent of {formatCurrency(summary.totalBudget, currency)}</p>
            </div>
            <p className={`text-sm font-semibold ${summary.percentage >= 100 ? 'text-red-600' : 'text-ink'}`}>
              {Math.round(summary.percentage)}%
            </p>
          </div>
          <div className="mt-4">
            <ProgressBar percentage={summary.percentage} />
          </div>
        </div>
      )}

      {loading ? (
        <Loader label="Loading budgets" />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No budgets yet"
            message="Set a monthly spending limit for a category and track it here."
            actionLabel="Create your first budget"
            onAction={openAdd}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const status = statusLabel(item.percentage);
            return (
              <div key={item._id} className="card card-hover p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage">
                      {item.category ? item.category.icon : '·'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.category ? item.category.name : ''}</p>
                      <p className={`text-[11px] ${status.color}`}>{status.text}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-muted transition hover:bg-sage hover:text-ink" title="Edit">
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold">{formatCurrency(item.spent, currency)}</span>
                    <span className="text-muted">of {formatCurrency(item.budget, currency)}</span>
                  </div>
                  <ProgressBar percentage={item.percentage} />
                  <p className="mt-2 text-[11px] text-muted">
                    {item.remaining >= 0
                      ? `${formatCurrency(item.remaining, currency)} left`
                      : `${formatCurrency(Math.abs(item.remaining), currency)} over`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit budget' : 'Add budget'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!editing && (
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
                <option value="">Select category</option>
                {expenseCategories
                  .filter((item) => !usedCategoryIds.includes(item._id))
                  .map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.icon} {item.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Amount for {monthName(month)} {year}</label>
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
          <div className="divider" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;
