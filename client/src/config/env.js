const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'ExpenseTracker',
  APP_TAGLINE: import.meta.env.VITE_APP_TAGLINE || 'Track every rupee',
  REQUEST_TIMEOUT: Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 15000,
};

export default env;
