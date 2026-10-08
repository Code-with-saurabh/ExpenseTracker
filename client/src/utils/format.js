import { CURRENCY_SYMBOLS, MONTH_NAMES } from './constants';

export const formatCurrency = (amount, currency = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const value = Number(amount || 0);
  return `${symbol}${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export const formatDate = (date) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateInput = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const monthName = (month) => MONTH_NAMES[month - 1];

export const initials = (name = '') => {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};
