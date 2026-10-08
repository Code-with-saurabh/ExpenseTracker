const RecurringExpense = require('../models/RecurringExpense');
const Transaction = require('../models/Transaction');
const { recurringPosted } = require('./notify');

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const nextDateAfter = (date, frequency) => {
  if (frequency === 'daily') return addDays(date, 1);
  if (frequency === 'weekly') return addDays(date, 7);
  if (frequency === 'monthly') return addMonths(date, 1);
  return addMonths(date, 12);
};

const processRecurring = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueItems = await RecurringExpense.find({
    user: userId,
    active: true,
    nextDate: { $lte: today },
  });

  for (const item of dueItems) {
    await Transaction.create({
      user: userId,
      type: 'expense',
      amount: item.amount,
      category: item.category,
      description: item.title,
      date: item.nextDate,
      paymentMethod: item.paymentMethod,
      isRecurring: true,
      recurringExpense: item._id,
    });

    item.nextDate = nextDateAfter(item.nextDate, item.frequency);
    await item.save();

    await recurringPosted(userId, item.title, item.amount);
  }

  return dueItems.length;
};

module.exports = { processRecurring };
