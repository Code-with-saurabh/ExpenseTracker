const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const RecurringExpense = require('../models/RecurringExpense');
const Notification = require('../models/Notification');
const { seedCategories } = require('../utils/defaultCategories');

const demoSeptember = [
  { type: 'income', amount: 50000, category: 'Salary', description: 'Monthly salary', date: '2026-09-01', paymentMethod: 'bank_transfer' },
  { type: 'income', amount: 5000, category: 'Freelance', description: 'Website design project', date: '2026-09-15', paymentMethod: 'upi' },
  { type: 'expense', amount: 12000, category: 'Rent', description: 'Apartment rent', date: '2026-09-02', paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 4200, category: 'Food', description: 'Grocery shopping', date: '2026-09-03', paymentMethod: 'debit_card', tags: ['home'] },
  { type: 'expense', amount: 2600, category: 'Transport', description: 'Fuel refill', date: '2026-09-05', paymentMethod: 'upi', tags: ['commute'] },
  { type: 'expense', amount: 3100, category: 'Bills', description: 'Electricity bill', date: '2026-09-07', paymentMethod: 'net_banking' },
  { type: 'expense', amount: 5400, category: 'Shopping', description: 'New headphones', date: '2026-09-09', paymentMethod: 'credit_card', tags: ['electronics'] },
  { type: 'expense', amount: 1800, category: 'Entertainment', description: 'Movie night', date: '2026-09-11', paymentMethod: 'upi' },
  { type: 'expense', amount: 2300, category: 'Health', description: 'Pharmacy medicines', date: '2026-09-13', paymentMethod: 'cash' },
  { type: 'expense', amount: 3600, category: 'Food', description: 'Dinner with friends', date: '2026-09-14', paymentMethod: 'credit_card', tags: ['friends'] },
  { type: 'expense', amount: 1500, category: 'Education', description: 'Online course', date: '2026-09-16', paymentMethod: 'upi', tags: ['learning'] },
  { type: 'expense', amount: 2900, category: 'Transport', description: 'Cab rides', date: '2026-09-18', paymentMethod: 'upi', tags: ['commute'] },
  { type: 'expense', amount: 4800, category: 'Shopping', description: 'Winter jacket', date: '2026-09-20', paymentMethod: 'credit_card' },
  { type: 'expense', amount: 2200, category: 'Food', description: 'Weekend groceries', date: '2026-09-22', paymentMethod: 'debit_card', tags: ['home'] },
  { type: 'expense', amount: 1200, category: 'Entertainment', description: 'Concert tickets', date: '2026-09-24', paymentMethod: 'upi' },
  { type: 'expense', amount: 3300, category: 'Bills', description: 'Internet bill', date: '2026-09-26', paymentMethod: 'net_banking' },
  { type: 'expense', amount: 2700, category: 'Travel', description: 'Train tickets', date: '2026-09-27', paymentMethod: 'upi', tags: ['trip'] },
  { type: 'expense', amount: 1900, category: 'Clothing', description: 'T-shirts', date: '2026-09-28', paymentMethod: 'debit_card' },
  { type: 'expense', amount: 800, category: 'Mobile', description: 'Mobile recharge', date: '2026-09-29', paymentMethod: 'upi' },
  { type: 'expense', amount: 1600, category: 'Food', description: 'Coffee shop week', date: '2026-09-30', paymentMethod: 'cash', tags: ['coffee'] },
];

const demoOctober = [
  { type: 'income', amount: 50000, category: 'Salary', description: 'Monthly salary', date: '2026-10-01', paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 12000, category: 'Rent', description: 'Apartment rent', date: '2026-10-01', paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 3800, category: 'Food', description: 'Monthly groceries', date: '2026-10-02', paymentMethod: 'debit_card', tags: ['home'] },
  { type: 'expense', amount: 1400, category: 'Transport', description: 'Metro card top-up', date: '2026-10-03', paymentMethod: 'upi', tags: ['commute'] },
  { type: 'expense', amount: 2100, category: 'Bills', description: 'Phone bill', date: '2026-10-04', paymentMethod: 'net_banking' },
  { type: 'expense', amount: 1750, category: 'Food', description: 'Team lunch', date: '2026-10-05', paymentMethod: 'credit_card', tags: ['work'] },
  { type: 'expense', amount: 2400, category: 'Entertainment', description: 'Streaming + games', date: '2026-10-05', paymentMethod: 'credit_card' },
  { type: 'expense', amount: 990, category: 'Health', description: 'Gym supplements', date: '2026-10-06', paymentMethod: 'upi' },
  { type: 'expense', amount: 3200, category: 'Shopping', description: 'Running shoes', date: '2026-10-06', paymentMethod: 'credit_card', tags: ['fitness'] },
  { type: 'expense', amount: 640, category: 'Food', description: 'Coffee with client', date: '2026-10-07', paymentMethod: 'cash', tags: ['coffee', 'work'] },
  { type: 'expense', amount: 1100, category: 'Transport', description: 'Auto rides', date: '2026-10-07', paymentMethod: 'cash', tags: ['commute'] },
];

const saurabhSeptember = [
  { type: 'income', amount: 75000, category: 'Salary', description: 'Monthly salary', date: '2026-09-01', paymentMethod: 'bank_transfer' },
  { type: 'income', amount: 12000, category: 'Freelance', description: 'Flutter app project', date: '2026-09-18', paymentMethod: 'upi', tags: ['side-income'] },
  { type: 'expense', amount: 15000, category: 'Rent', description: 'Flat rent', date: '2026-09-02', paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 3400, category: 'Food', description: 'Groceries', date: '2026-09-04', paymentMethod: 'debit_card', tags: ['home'] },
  { type: 'expense', amount: 2100, category: 'Transport', description: 'Petrol', date: '2026-09-06', paymentMethod: 'upi', tags: ['commute'] },
  { type: 'expense', amount: 6200, category: 'Shopping', description: 'Headphones', date: '2026-09-10', paymentMethod: 'credit_card', tags: ['electronics'] },
  { type: 'expense', amount: 2400, category: 'Entertainment', description: 'Movie + snacks', date: '2026-09-14', paymentMethod: 'upi' },
  { type: 'expense', amount: 2800, category: 'Bills', description: 'Electricity bill', date: '2026-09-20', paymentMethod: 'net_banking' },
  { type: 'expense', amount: 1900, category: 'Food', description: 'Weekend dinner', date: '2026-09-25', paymentMethod: 'cash', tags: ['friends'] },
  { type: 'expense', amount: 1600, category: 'Health', description: 'Doctor visit', date: '2026-09-28', paymentMethod: 'upi' },
];

const saurabhOctober = [
  { type: 'income', amount: 75000, category: 'Salary', description: 'Monthly salary', date: '2026-10-01', paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 15000, category: 'Rent', description: 'Flat rent', date: '2026-10-01', paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 2600, category: 'Food', description: 'Monthly groceries', date: '2026-10-02', paymentMethod: 'debit_card', tags: ['home'] },
  { type: 'expense', amount: 1300, category: 'Transport', description: 'Fuel', date: '2026-10-03', paymentMethod: 'upi', tags: ['commute'] },
  { type: 'expense', amount: 4900, category: 'Shopping', description: 'Running shoes', date: '2026-10-04', paymentMethod: 'credit_card', tags: ['fitness'] },
  { type: 'expense', amount: 2200, category: 'Bills', description: 'Phone + internet', date: '2026-10-05', paymentMethod: 'net_banking' },
  { type: 'expense', amount: 1500, category: 'Entertainment', description: 'OTT subscriptions', date: '2026-10-06', paymentMethod: 'credit_card' },
  { type: 'expense', amount: 1200, category: 'Food', description: 'Coffee with team', date: '2026-10-07', paymentMethod: 'cash', tags: ['coffee', 'work'] },
];

const demoBudgets = [
  { category: 'Food', amount: 8000 },
  { category: 'Transport', amount: 4000 },
  { category: 'Shopping', amount: 5000 },
  { category: 'Entertainment', amount: 3000 },
  { category: 'Bills', amount: 5000 },
];

const saurabhBudgets = [
  { category: 'Food', amount: 8000 },
  { category: 'Shopping', amount: 7000 },
  { category: 'Transport', amount: 4000 },
];

const demoRecurring = [
  { title: 'Netflix', amount: 649, category: 'Entertainment', nextDate: '2026-11-01' },
  { title: 'Internet', amount: 1499, category: 'Bills', nextDate: '2026-11-05' },
  { title: 'Apartment Rent', amount: 12000, category: 'Rent', nextDate: '2026-11-01' },
  { title: 'Gym Membership', amount: 1500, category: 'Health', nextDate: '2026-11-03' },
  { title: 'Mobile Plan', amount: 499, category: 'Mobile', nextDate: '2026-10-05' },
];

const saurabhRecurring = [
  { title: 'Netflix', amount: 649, category: 'Entertainment', nextDate: '2026-11-01' },
  { title: 'Electricity Bill', amount: 2500, category: 'Bills', nextDate: '2026-10-04' },
  { title: 'Gym Membership', amount: 1200, category: 'Health', nextDate: '2026-11-08' },
];

const demoGoals = [
  { title: 'New Laptop', targetAmount: 80000, currentAmount: 45000, targetDate: '2027-03-31', icon: '💻' },
  { title: 'Goa Trip', targetAmount: 30000, currentAmount: 18000, targetDate: '2027-01-15', icon: '🏖️' },
  { title: 'Emergency Fund', targetAmount: 100000, currentAmount: 62000, targetDate: '2027-12-31', icon: '🛡️' },
];

const saurabhGoals = [
  { title: 'New Bike', targetAmount: 45000, currentAmount: 12000, targetDate: '2027-04-30', icon: '🚲' },
  { title: 'Japan Trip', targetAmount: 250000, currentAmount: 55000, targetDate: '2027-10-01', icon: '✈️' },
  { title: 'Emergency Fund', targetAmount: 200000, currentAmount: 90000, targetDate: '2027-12-31', icon: '🛡️' },
];

const loadCategoryMap = async (userId) => {
  const docs = await Category.find({ user: userId });
  const map = {};
  for (const item of docs) {
    map[item.name] = item._id;
  }
  return map;
};

const seedTransactions = async (userId, categories, list) => {
  const docs = list.map((item) => ({
    user: userId,
    type: item.type,
    amount: item.amount,
    category: categories[item.category],
    description: item.description,
    date: new Date(item.date),
    paymentMethod: item.paymentMethod,
    tags: item.tags || [],
    notes: '',
  }));
  await Transaction.insertMany(docs);
  return docs.length;
};

const seedBudgets = async (userId, categories, list) => {
  for (const item of list) {
    await Budget.create({ user: userId, category: categories[item.category], amount: item.amount, month: 10, year: 2026 });
  }
  return list.length;
};

const seedRecurring = async (userId, categories, list) => {
  for (const item of list) {
    await RecurringExpense.create({
      user: userId,
      title: item.title,
      amount: item.amount,
      category: categories[item.category],
      frequency: 'monthly',
      nextDate: new Date(item.nextDate),
      paymentMethod: 'upi',
      active: true,
    });
  }
  return list.length;
};

const seedGoals = async (userId, list) => {
  for (const item of list) {
    await SavingsGoal.create({
      user: userId,
      title: item.title,
      targetAmount: item.targetAmount,
      currentAmount: item.currentAmount,
      targetDate: new Date(item.targetDate),
      icon: item.icon,
    });
  }
  return list.length;
};

const createUserWithData = async (profile, data) => {
  const user = await User.create(profile);
  await seedCategories(user._id);

  const categories = await loadCategoryMap(user._id);

  const txCount = await seedTransactions(user._id, categories, data.transactions);
  const budgetCount = await seedBudgets(user._id, categories, data.budgets);
  const recurringCount = await seedRecurring(user._id, categories, data.recurring);
  const goalCount = await seedGoals(user._id, data.goals);

  console.log(`- ${profile.email}: ${txCount} transactions, ${budgetCount} budgets, ${recurringCount} recurring, ${goalCount} goals`);
  return user;
};

const run = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await RecurringExpense.deleteMany({});
    await SavingsGoal.deleteMany({});
    await Notification.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    await createUserWithData(
      { name: 'Demo User', email: 'demo@example.com', password: 'password123', currency: 'INR', monthlyIncome: 50000 },
      { transactions: [...demoSeptember, ...demoOctober], budgets: demoBudgets, recurring: demoRecurring, goals: demoGoals }
    );

    await createUserWithData(
      { name: 'Saurabh', email: 'saurabh@gmail.com', password: 'saurabh123', currency: 'INR', monthlyIncome: 75000 },
      { transactions: [...saurabhSeptember, ...saurabhOctober], budgets: saurabhBudgets, recurring: saurabhRecurring, goals: saurabhGoals }
    );

    console.log('--- Seed Complete ---');
    console.log('Logins:');
    console.log('  demo@example.com / password123');
    console.log('  saurabh@gmail.com / saurabh123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

run();
