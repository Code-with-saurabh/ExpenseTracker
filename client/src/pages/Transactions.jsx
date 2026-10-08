import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiSearch,
  FiStar,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
} from 'react-icons/fi';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  toggleFavorite,
  clearLastAdded,
} from '../features/transactionSlice';
import { fetchCategories } from '../features/categorySlice';
import useDebounce from '../hooks/useDebounce';
import API from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Loader';
import { formatDate, formatDateInput, formatCurrency } from '../utils/format';
import { sanitizeAmountInput } from '../utils/amount';
import { PAYMENT_METHODS } from '../utils/constants';

const emptyForm = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  date: formatDateInput(new Date()),
  paymentMethod: 'cash',
  tags: '',
  notes: '',
};

const Transactions = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, pagination, loading, lastAddedId } = useSelector((state) => state.transactions);
  const categories = useSelector((state) => state.categories.items);
  const { user } = useSelector((state) => state.auth);
  const currency = user ? user.currency : 'INR';

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
    favorite: false,
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!lastAddedId) return;
    const timer = setTimeout(() => dispatch(clearLastAdded()), 900);
    return () => clearTimeout(timer);
  }, [lastAddedId, dispatch]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openAdd();
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const params = { page, limit: 10 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.favorite) params.favorite = 'true';

    dispatch(fetchTransactions(params));
  }, [dispatch, page, debouncedSearch, filters]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      type: item.type,
      amount: item.amount,
      category: item.category ? item.category._id : '',
      description: item.description,
      date: formatDateInput(item.date),
      paymentMethod: item.paymentMethod,
      tags: (item.tags || []).join(', '),
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      description: form.description,
      date: form.date,
      paymentMethod: form.paymentMethod,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes: form.notes,
    };

    let result;
    if (editing) {
      result = await dispatch(updateTransaction({ id: editing._id, data: payload }));
    } else {
      result = await dispatch(createTransaction(payload));
    }

    setSaving(false);

    if (result.error) {
      toast.error(result.payload);
      return;
    }

    toast.success(editing ? 'Transaction updated' : 'Transaction added');
    setModalOpen(false);

    if (!editing) {
      setPage(1);
      dispatch(fetchTransactions({ page: 1, limit: 10, search: debouncedSearch, type: filters.type, category: filters.category }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    const result = await dispatch(deleteTransaction(id));
    if (result.error) toast.error(result.payload);
    else toast.success('Transaction deleted');
  };

  const handleFavorite = (id) => {
    dispatch(toggleFavorite(id));
  };

  const handleReceipt = async (event, id) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      await API.patch(`/transactions/${id}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(fetchTransactions({ page, limit: 10, search: debouncedSearch, type: filters.type, category: filters.category }));
      toast.success('Receipt uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
    event.target.value = '';
  };

  const exportCsv = async () => {
    try {
      const res = await API.get('/transactions/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const updateFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', type: '', category: '', paymentMethod: '', startDate: '', endDate: '', favorite: false });
    setPage(1);
  };

  const formCategories = categories.filter((item) => item.type === form.type);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => (key === 'favorite' ? value : Boolean(value))).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted">{pagination.total} records</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">All transactions</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="btn-outline">
            <FiDownload size={14} /> Export CSV
          </button>
          <button onClick={openAdd} className="btn-primary">
            <FiPlus size={15} /> Add transaction
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              placeholder="Search descriptions..."
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
          </div>
          <button onClick={() => setShowFilters((value) => !value)} className={`btn-outline ${showFilters ? 'bg-sage' : ''}`}>
            <FiFilter size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <button
            onClick={() => updateFilter('favorite', !filters.favorite)}
            className={`btn-outline ${filters.favorite ? 'bg-beige text-ink' : ''}`}
          >
            <FiStar size={14} /> Favorites
          </button>
        </div>

        {showFilters && (
          <div className="anim-fade mt-3 grid gap-2 border-t border-line pt-3 sm:grid-cols-3 lg:grid-cols-6">
            <select className="input" value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
              <option value="">All types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select className="input" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.icon} {item.name}
                </option>
              ))}
            </select>
            <select className="input" value={filters.paymentMethod} onChange={(event) => updateFilter('paymentMethod', event.target.value)}>
              <option value="">All payments</option>
              {PAYMENT_METHODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <input type="date" className="input" value={filters.startDate} onChange={(event) => updateFilter('startDate', event.target.value)} />
            <input type="date" className="input" value={filters.endDate} onChange={(event) => updateFilter('endDate', event.target.value)} />
            <button onClick={clearFilters} className="btn-outline justify-center">
              <FiX size={14} /> Clear
            </button>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <SkeletonTable rows={6} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            message="Start tracking your first expense."
            actionLabel="Add your first expense"
            onAction={openAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Description</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Payment</th>
                  <th className="table-th text-right">Amount</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className={`row-hover ${lastAddedId === item._id ? 'anim-flash' : ''}`}>
                    <td className="table-td whitespace-nowrap text-muted">{formatDate(item.date)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.description}</span>
                        {item.receipt && (
                          <button onClick={() => setLightbox(item.receipt)} className="text-accent hover:underline">
                            <FiUpload size={12} />
                          </button>
                        )}
                      </div>
                      {(item.tags || []).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span key={tag} className="chip">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="table-td">
                      <span className="flex items-center gap-2">
                        {item.category ? item.category.icon : '·'} {item.category ? item.category.name : ''}
                      </span>
                    </td>
                    <td className="table-td text-muted">
                      {(PAYMENT_METHODS.find((method) => method.value === item.paymentMethod) || {}).label || item.paymentMethod}
                    </td>
                    <td className={`table-td text-right font-semibold ${item.type === 'income' ? 'text-accent' : 'text-red-600'}`}>
                      {item.type === 'income' ? '+' : '-'}
                      {formatCurrency(item.amount, currency)}
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <label className="cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-sage hover:text-ink" title="Upload receipt">
                          <FiUpload size={14} />
                          <input type="file" accept="image/*" className="hidden" onChange={(event) => handleReceipt(event, item._id)} />
                        </label>
                        <button
                          onClick={() => handleFavorite(item._id)}
                          className={`rounded-lg p-1.5 transition hover:bg-sage ${item.isFavorite ? 'text-amber-500' : 'text-muted'}`}
                          title="Favorite"
                        >
                          <FiStar size={14} fill={item.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-1.5 text-muted transition hover:bg-sage hover:text-ink"
                          title="Edit"
                        >
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <p className="text-[11px] text-muted">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn-outline btn-sm disabled:opacity-40">
                <FiChevronLeft size={14} />
              </button>
              {Array.from({ length: pagination.pages })
                .slice(0, 6)
                .map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPage(index + 1)}
                    className={`btn-sm rounded-lg border px-2.5 py-1.5 text-xs transition ${
                      page === index + 1 ? 'border-primary bg-primary text-onprimary' : 'border-line bg-surface text-muted hover:bg-sage'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              <button onClick={() => setPage(page + 1)} disabled={page === pagination.pages} className="btn-outline btn-sm disabled:opacity-40">
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit transaction' : 'Add transaction'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'expense' })}
              className={`btn ${form.type === 'expense' ? 'bg-primary text-onprimary' : 'border border-line bg-surface text-muted'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'income' })}
              className={`btn ${form.type === 'income' ? 'bg-primary text-onprimary' : 'border border-line bg-surface text-muted'}`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                className="input"
                placeholder="0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: sanitizeAmountInput(event.target.value) })}
                required
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
              <option value="">Select category</option>
              {formCategories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.icon} {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              placeholder="What was it for?"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="label">Tags (comma separated)</label>
              <input
                type="text"
                className="input"
                placeholder="home, work"
                value={form.tags}
                onChange={(event) => setForm({ ...form, tags: event.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Optional notes"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              maxLength={500}
            />
          </div>

          <div className="divider" />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(lightbox)} title="Receipt" onClose={() => setLightbox(null)}>
        {lightbox && <img src={lightbox} alt="Receipt" className="mx-auto max-h-[70vh] rounded-lg" />}
      </Modal>
    </div>
  );
};

export default Transactions;
