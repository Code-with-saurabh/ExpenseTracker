import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMenu, FiBell, FiSun, FiMoon, FiLogOut, FiUser, FiCheck } from 'react-icons/fi';
import { fetchNotifications, markAllRead, markOneRead } from '../../features/notificationSlice';
import { toggleTheme } from '../../features/themeSlice';
import { logout } from '../../features/authSlice';
import { initials } from '../../utils/format';

const titles = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/analytics': 'Analytics',
  '/reports': 'Reports',
  '/goals': 'Savings Goals',
  '/recurring': 'Recurring Expenses',
  '/categories': 'Categories',
  '/profile': 'Profile',
};

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const dark = useSelector((state) => state.theme.dark);
  const { items, unreadCount } = useSelector((state) => state.notifications);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchNotifications());
    const timer = setInterval(() => dispatch(fetchNotifications()), 60000);
    return () => clearInterval(timer);
  }, [dispatch, user]);

  useEffect(() => {
    const onClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  };

  const path = location.pathname;
  const title = titles[path] || 'ExpenseTracker';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-muted transition hover:bg-sage hover:text-ink lg:hidden">
          <FiMenu size={18} />
        </button>
        <div>
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted">ExpenseTracker</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="rounded-lg border border-line bg-surface p-2 text-muted transition duration-150 hover:-translate-y-0.5 hover:text-ink hover:shadow-soft"
          title="Toggle dark mode"
        >
          {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications((value) => !value)}
            className="relative rounded-lg border border-line bg-surface p-2 text-muted transition duration-150 hover:-translate-y-0.5 hover:text-ink hover:shadow-soft"
            title="Notifications"
          >
            <FiBell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="card anim-fade absolute right-0 mt-2 max-h-96 w-80 overflow-hidden shadow-lift">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest">Notifications</p>
                <button
                  onClick={() => dispatch(markAllRead())}
                  className="flex items-center gap-1 text-[11px] text-accent transition hover:underline"
                >
                  <FiCheck size={12} /> Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {items.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted">No notifications yet.</p>}
                {items.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => dispatch(markOneRead(item._id))}
                    className={`block w-full border-b border-line px-4 py-3 text-left transition duration-150 hover:bg-rowhover ${
                      item.read ? 'opacity-60' : ''
                    }`}
                  >
                    <p className="text-xs font-medium">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{item.message}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-onprimary transition duration-150 hover:-translate-y-0.5 hover:shadow-soft"
          >
            {user ? initials(user.name) : 'ET'}
          </button>

          {showProfile && (
            <div className="card anim-fade absolute right-0 mt-2 w-48 overflow-hidden shadow-lift">
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-xs font-semibold">{user ? user.name : ''}</p>
                <p className="truncate text-[11px] text-muted">{user ? user.email : ''}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-xs transition hover:bg-rowhover"
              >
                <FiUser size={14} /> Profile
              </button>
              <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-600 transition hover:bg-rowhover">
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
