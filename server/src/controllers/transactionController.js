const fs = require('fs');
const path = require('path');
const Transaction = require('../models/Transaction');
const buildCsv = require('../utils/buildCsv');
const { getBudgetStatus } = require('../utils/budgetStatus');
const { checkBudgets } = require('../utils/notify');
const { toAmount } = require('../utils/sanitize');

const alertBudgetsFor = async (user, date) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const budgets = await getBudgetStatus(user._id, month, year);
  await checkBudgets(user._id, month, year, budgets);
};

const removeReceiptFile = (receipt) => {
  if (!receipt) return;
  const filePath = path.join(__dirname, '../../uploads', path.basename(receipt));
  fs.unlink(filePath, (err) => {
    if (err) return;
  });
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date, paymentMethod, tags, notes, isRecurring, recurringExpense } = req.body;

    const validAmount = toAmount(amount);
    if (validAmount === null) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount greater than 0' });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount: validAmount,
      category,
      description,
      date: date || new Date(),
      paymentMethod,
      tags: tags || [],
      notes: notes || '',
      isRecurring: isRecurring || false,
      recurringExpense: recurringExpense || null,
    });

    const populated = await transaction.populate('category', 'name icon color type');
    await alertBudgetsFor(req.user, new Date(date || Date.now()));

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, category, paymentMethod, tag, search, startDate, endDate, minAmount, maxAmount, favorite } = req.query;

    const query = { user: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (tag) query.tags = tag;
    if (favorite === 'true') query.isFavorite = true;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('category', 'name icon color type')
      .sort({ date: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getFavoriteTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id, isFavorite: true })
      .populate('category', 'name icon color type')
      .sort({ date: -1 })
      .limit(10);

    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id }).populate('category', 'name icon color type');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (req.body.amount !== undefined) {
      const validAmount = toAmount(req.body.amount);
      if (validAmount === null) {
        return res.status(400).json({ success: false, message: 'Please provide a valid amount greater than 0' });
      }
      transaction.amount = validAmount;
    }

    const allowedFields = ['type', 'category', 'description', 'date', 'paymentMethod', 'tags', 'notes', 'receipt', 'isFavorite'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        transaction[field] = req.body[field];
      }
    }

    await transaction.save();
    await transaction.populate('category', 'name icon color type');
    await alertBudgetsFor(req.user, new Date(transaction.date));

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    removeReceiptFile(transaction.receipt);

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.isFavorite = !transaction.isFavorite;
    await transaction.save();
    await transaction.populate('category', 'name icon color type');

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.uploadReceipt = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please choose an image' });
    }

    removeReceiptFile(transaction.receipt);

    transaction.receipt = '/uploads/' + req.file.filename;
    await transaction.save();
    await transaction.populate('category', 'name icon color type');

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const query = { user: req.user.id };
    if (req.query.type) query.type = req.query.type;
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
    }

    const transactions = await Transaction.find(query).populate('category', 'name').sort({ date: -1 });
    const csv = buildCsv(transactions);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
