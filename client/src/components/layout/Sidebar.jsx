import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiHome, FiList, FiPieChart, FiBarChart2, FiFileText, FiTarget, FiRepeat, FiTag, FiUser, FiX } from 'react-icons/fi';
import env from '../../config/env';

const links = [
  { to: '/', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/transactions', label: 'Transactions', icon: FiList },
  { to: '/budgets', label: 'Budgets', icon: FiPieChart },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/reports', label: 'Reports', icon: FiFileText },
  { to: '/goals', label: 'Savings Goals', icon: FiTarget },
  { to: '/recurring', label: 'Recurring', icon: FiRepeat },
  { to: '/categories', label: 'Categories', icon: FiTag },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

const Sidebar = ({ open, onClose }) => {
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-sage transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-onprimary">
              ET
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{env.APP_NAME}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted">{env.APP_TAGLINE}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted lg:hidden">
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition duration-150 ${
                  isActive ? 'bg-surface font-semibold text-ink shadow-soft' : 'text-muted hover:bg-surface hover:text-ink'
                }`
              }
            >
              <link.icon size={16} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line px-4 py-3">
          <p className="truncate text-xs font-medium">{user ? user.name : 'Guest'}</p>
          <p className="truncate text-[11px] text-muted">{user ? user.email : ''}</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
