const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const RecurringExpense = require('../models/RecurringExpense');

exports.getCategories = async (req, res, next) => {
  try {
    const query = { user: req.user.id };
    if (req.query.type) query.type = req.query.type;

    const categories = await Category.find(query).sort({ type: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;

    const existing = await Category.findOne({ user: req.user.id, name, type });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ user: req.user.id, name, type, icon, color });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, icon, color } = req.body;
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const used = await Transaction.countDocuments({ user: req.user.id, category: category._id });
    const usedInRecurring = await RecurringExpense.countDocuments({ user: req.user.id, category: category._id });
    if (used > 0 || usedInRecurring > 0) {
      return res.status(400).json({ success: false, message: 'Category is in use, cannot delete' });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
