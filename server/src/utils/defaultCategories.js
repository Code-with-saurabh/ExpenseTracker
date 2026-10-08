const Category = require('../models/Category');

const defaultCategories = [
  { name: 'Food', type: 'expense', icon: '🍔', color: '#C2703D' },
  { name: 'Transport', type: 'expense', icon: '🚌', color: '#78816A' },
  { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#A97C64' },
  { name: 'Rent', type: 'expense', icon: '🏠', color: '#8B6F5C' },
  { name: 'Bills', type: 'expense', icon: '📄', color: '#6E7B8B' },
  { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#B08968' },
  { name: 'Health', type: 'expense', icon: '💊', color: '#7D8F69' },
  { name: 'Education', type: 'expense', icon: '📚', color: '#5F6B5A' },
  { name: 'Travel', type: 'expense', icon: '✈️', color: '#C08552' },
  { name: 'Subscriptions', type: 'expense', icon: '📺', color: '#9A8C7A' },
  { name: 'Clothing', type: 'expense', icon: '👕', color: '#A68A7D' },
  { name: 'Mobile', type: 'expense', icon: '📱', color: '#8A9A5B' },
  { name: 'Other', type: 'expense', icon: '📦', color: '#8B8B83' },
  { name: 'Salary', type: 'income', icon: '💼', color: '#78816A' },
  { name: 'Freelance', type: 'income', icon: '💻', color: '#6B8E5A' },
  { name: 'Investment', type: 'income', icon: '📈', color: '#5E7A5B' },
  { name: 'Gift', type: 'income', icon: '🎁', color: '#B08D57' },
  { name: 'Interest', type: 'income', icon: '🏦', color: '#8C8B6B' },
  { name: 'Other Income', type: 'income', icon: '💰', color: '#949B7E' },
];

const seedCategories = async (userId) => {
  const existing = await Category.countDocuments({ user: userId });
  if (existing > 0) return;

  const docs = defaultCategories.map((item) => ({ ...item, user: userId }));
  await Category.insertMany(docs);
};

module.exports = { seedCategories };
