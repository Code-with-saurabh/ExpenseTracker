const RecurringExpense = require('../models/RecurringExpense');
const { toAmount } = require('../utils/sanitize');

exports.getRecurringExpenses = async (req, res, next) => {
  try {
    const items = await RecurringExpense.find({ user: req.user.id })
      .populate('category', 'name icon color type')
      .sort({ nextDate: 1 });

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.createRecurringExpense = async (req, res, next) => {
  try {
    const { title, amount, category, frequency, nextDate, paymentMethod } = req.body;

    const validAmount = toAmount(amount);
    if (validAmount === null) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount greater than 0' });
    }

    const item = await RecurringExpense.create({
      user: req.user.id,
      title,
      amount: validAmount,
      category,
      frequency,
      nextDate,
      paymentMethod,
    });

    await item.populate('category', 'name icon color type');
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateRecurringExpense = async (req, res, next) => {
  try {
    const item = await RecurringExpense.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Recurring expense not found' });
    }

    if (req.body.amount !== undefined) {
      const validAmount = toAmount(req.body.amount);
      if (validAmount === null) {
        return res.status(400).json({ success: false, message: 'Please provide a valid amount greater than 0' });
      }
      item.amount = validAmount;
    }

    const allowedFields = ['title', 'category', 'frequency', 'nextDate', 'paymentMethod'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    }

    await item.save();
    await item.populate('category', 'name icon color type');

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.deleteRecurringExpense = async (req, res, next) => {
  try {
    const item = await RecurringExpense.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Recurring expense not found' });
    }

    res.json({ success: true, message: 'Recurring expense deleted' });
  } catch (error) {
    next(error);
  }
};

exports.toggleRecurringExpense = async (req, res, next) => {
  try {
    const item = await RecurringExpense.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Recurring expense not found' });
    }

    item.active = !item.active;
    await item.save();
    await item.populate('category', 'name icon color type');

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
