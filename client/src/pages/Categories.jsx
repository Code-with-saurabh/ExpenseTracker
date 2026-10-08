import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { fetchCategories, createCategory, deleteCategory } from '../features/categorySlice';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../utils/constants';

const Categories = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.categories);

  const [tab, setTab] = useState('expense');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '📦', color: CATEGORY_COLORS[0] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filtered = items.filter((item) => item.type === tab);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const result = await dispatch(createCategory({ ...form, type: tab }));
    setSaving(false);

    if (result.error) {
      toast.error(result.payload);
      return;
    }

    toast.success('Category created');
    setModalOpen(false);
    setForm({ name: '', icon: '📦', color: CATEGORY_COLORS[0] });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    const result = await dispatch(deleteCategory(id));
    if (result.error) toast.error(result.payload);
    else toast.success('Category deleted');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted">Organise your money</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Categories</h2>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <FiPlus size={15} /> Add category
        </button>
      </div>

      <div className="flex gap-2">
        {['expense', 'income'].map((type) => (
          <button
            key={type}
            onClick={() => setTab(type)}
            className={`btn ${tab === type ? 'bg-primary text-onprimary' : 'border border-line bg-surface text-muted'}`}
          >
            {type === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Loading categories" />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title={`No ${tab} categories`}
            message="Create categories to classify your transactions."
            actionLabel="Add category"
            onAction={() => setModalOpen(true)}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <div key={item._id} className="card card-hover flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${item.color}26` }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <div className="mt-0.5 h-1.5 w-10 rounded-full" style={{ backgroundColor: item.color }} />
                </div>
              </div>
              <button
                onClick={() => handleDelete(item._id)}
                className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                title="Delete"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={`New ${tab} category`} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              className="input"
              placeholder="Category name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              maxLength={50}
            />
          </div>

          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`h-9 w-9 rounded-lg border text-base transition duration-150 ${
                    form.icon === icon ? 'border-primary bg-sage' : 'border-line hover:bg-sage'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`h-7 w-7 rounded-full transition duration-150 ${form.color === color ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="divider" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Create category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
