import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { fetchGoals, createGoal, updateGoal, deleteGoal, addMoneyToGoal } from '../features/goalSlice';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import ProgressBar from '../components/ProgressBar';
import { formatCurrency, formatDate } from '../utils/format';
import { sanitizeAmountInput } from '../utils/amount';

const emptyForm = { title: '', targetAmount: '', currentAmount: '', targetDate: '', description: '', icon: '🎯' };

const Goals = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.goals);
  const { user } = useSelector((state) => state.auth);
  const currency = user ? user.currency : 'INR';

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [moneyGoal, setMoneyGoal] = useState(null);
  const [moneyAmount, setMoneyAmount] = useState('');

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      targetAmount: item.targetAmount,
      currentAmount: item.currentAmount,
      targetDate: item.targetDate ? item.targetDate.slice(0, 10) : '',
      description: item.description || '',
      icon: item.icon || '🎯',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount || 0),
      targetDate: form.targetDate || null,
      description: form.description,
      icon: form.icon,
    };

    let result;
    if (editing) {
      result = await dispatch(updateGoal({ id: editing._id, data: payload }));
    } else {
      result = await dispatch(createGoal(payload));
    }

    setSaving(false);

    if (result.error) {
      toast.error(result.payload);
      return;
    }

    toast.success(editing ? 'Goal updated' : 'Goal created');
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    const result = await dispatch(deleteGoal(id));
    if (result.error) toast.error(result.payload);
    else toast.success('Goal deleted');
  };

  const handleAddMoney = async (event) => {
    event.preventDefault();
    const result = await dispatch(addMoneyToGoal({ id: moneyGoal._id, amount: Number(moneyAmount) }));
    if (result.error) {
      toast.error(result.payload);
      return;
    }
    toast.success('Money added to goal');
    setMoneyGoal(null);
    setMoneyAmount('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted">Save for what matters</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Savings goals</h2>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <FiPlus size={15} /> New goal
        </button>
      </div>

      {loading ? (
        <Loader label="Loading goals" />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No savings goals yet"
            message="Set a target and watch your progress grow."
            actionLabel="Create your first goal"
            onAction={openAdd}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="card card-hover p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage text-lg">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-[11px] text-muted">{item.targetDate ? `by ${formatDate(item.targetDate)}` : 'no deadline'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-muted transition hover:bg-sage hover:text-ink">
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold">{formatCurrency(item.currentAmount, currency)}</span>
                  <span className="text-muted">of {formatCurrency(item.targetAmount, currency)}</span>
                </div>
                <ProgressBar percentage={item.percentage} />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-muted">{Math.round(item.percentage)}% complete</p>
                  <button onClick={() => setMoneyGoal(item)} className="btn-accent btn-sm">
                    Add money
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit goal' : 'New goal'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div>
              <label className="label">Icon</label>
              <input className="input text-center" maxLength={2} value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} />
            </div>
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                className="input"
                placeholder="New laptop"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className="input"
                placeholder="0"
                value={form.targetAmount}
                onChange={(event) => setForm({ ...form, targetAmount: sanitizeAmountInput(event.target.value) })}
                required
              />
            </div>
            <div>
              <label className="label">Already saved</label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className="input"
                placeholder="0"
                value={form.currentAmount}
                onChange={(event) => setForm({ ...form, currentAmount: sanitizeAmountInput(event.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="label">Target date</label>
            <input type="date" className="input" value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="divider" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create goal'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(moneyGoal)} title={`Add money · ${moneyGoal ? moneyGoal.title : ''}`} onClose={() => setMoneyGoal(null)}>
        <form onSubmit={handleAddMoney} className="space-y-3">
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              className="input"
              placeholder="0"
              value={moneyAmount}
              onChange={(event) => setMoneyAmount(sanitizeAmountInput(event.target.value))}
              required
              autoFocus
            />
          </div>
          <div className="divider" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setMoneyGoal(null)} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add money
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Goals;
