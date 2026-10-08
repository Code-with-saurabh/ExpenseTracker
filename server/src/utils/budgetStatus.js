const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const getBudgetStatus = async (userId, month, year) => {
  const budgets = await Budget.find({ user: userId, month, year }).populate('category', 'name icon color type');

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const items = [];

  for (const budget of budgets) {
    const spentAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          category: budget.category._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const spent = spentAgg.length > 0 ? spentAgg[0].total : 0;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    items.push({
      _id: budget._id,
      category: budget.category,
      budget: budget.amount,
      spent,
      percentage,
      remaining: budget.amount - spent,
    });
  }

  return items;
};

module.exports = { getBudgetStatus };
