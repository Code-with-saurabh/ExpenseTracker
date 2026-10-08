const Budget = require('../models/Budget');
const { getBudgetStatus } = require('../utils/budgetStatus');
const { toAmount } = require('../utils/sanitize');

exports.getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const items = await getBudgetStatus(req.user._id, month, year);

    const totalBudget = items.reduce((sum, item) => sum + item.budget, 0);
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);

    res.json({
      success: true,
      data: items,
      summary: {
        month,
        year,
        totalBudget,
        totalSpent,
        percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    const validAmount = toAmount(amount);
    if (validAmount === null) {
      return res.status(400).json({ success: false, message: 'Please provide a valid budget amount greater than 0' });
    }

    const existing = await Budget.findOne({ user: req.user.id, category, month, year });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Budget already exists for this category and month' });
    }

    const budget = await Budget.create({ user: req.user.id, category, amount: validAmount, month, year });
    await budget.populate('category', 'name icon color type');

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (req.body.amount !== undefined) {
      const validAmount = toAmount(req.body.amount);
      if (validAmount === null) {
        return res.status(400).json({ success: false, message: 'Please provide a valid budget amount greater than 0' });
      }
      budget.amount = validAmount;
    }
    await budget.save();
    await budget.populate('category', 'name icon color type');

    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};
