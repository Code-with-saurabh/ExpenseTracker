import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/authSlice';
import transactions from '../features/transactionSlice';
import categories from '../features/categorySlice';
import budgets from '../features/budgetSlice';
import goals from '../features/goalSlice';
import recurring from '../features/recurringSlice';
import notifications from '../features/notificationSlice';
import theme from '../features/themeSlice';

const store = configureStore({
  reducer: {
    auth,
    transactions,
    categories,
    budgets,
    goals,
    recurring,
    notifications,
    theme,
  },
});

export default store;
