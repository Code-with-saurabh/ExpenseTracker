import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './features/authSlice';
import { getTheme, applyTheme } from './themes';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Recurring from './pages/Recurring';
import Categories from './pages/Categories';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  if (token) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const dark = useSelector((state) => state.theme.dark);
  const themeId = useSelector((state) => state.theme.themeId);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    applyTheme(getTheme(themeId), dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('themeId', themeId);
  }, [dark, themeId]);

  useEffect(() => {
    if (token) dispatch(getMe());
  }, [dispatch, token]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="goals" element={<Goals />} />
        <Route path="recurring" element={<Recurring />} />
        <Route path="categories" element={<Categories />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
