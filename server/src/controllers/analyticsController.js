const Transaction = require('../models/Transaction');
const { processRecurring } = require('../utils/processRecurring');
const { getBudgetStatus } = require('../utils/budgetStatus');
const { checkBudgets } = require('../utils/notify');

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthWindow = (month, year) => ({
  start: new Date(year, month - 1, 1),
  end: new Date(year, month, 0, 23, 59, 59, 999),
});

const sumByType = (rows) => {
  let income = 0;
  let expense = 0;

  for (const row of rows) {
    if (row._id === 'income') income = row.total;
    if (row._id === 'expense') expense = row.total;
  }

  return { income, expense };
};

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await processRecurring(userId);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const win = monthWindow(month, year);

    const allTimeRows = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);
    const allTime = sumByType(allTimeRows);

    const monthRows = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: win.start, $lte: win.end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);
    const monthTotals = sumByType(monthRows);

    const categoryRows = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: win.start, $lte: win.end } } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryDoc' } },
      { $unwind: '$categoryDoc' },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryDoc.name' },
          icon: { $first: '$categoryDoc.icon' },
          color: { $first: '$categoryDoc.color' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categoryTotal = categoryRows.reduce((sum, row) => sum + row.total, 0);
    const categoryBreakdown = categoryRows.map((row) => ({
      ...row,
      percentage: categoryTotal > 0 ? (row.total / categoryTotal) * 100 : 0,
    }));

    const recentTransactions = await Transaction.find({ user: userId })
      .populate('category', 'name icon color type')
      .sort({ date: -1 })
      .limit(5);

    const budgetStatus = await getBudgetStatus(userId, month, year);
    await checkBudgets(userId, month, year, budgetStatus);

    res.json({
      success: true,
      data: {
        balance: allTime.income - allTime.expense,
        totalIncome: allTime.income,
        totalExpense: allTime.expense,
        monthlyIncome: monthTotals.income,
        monthlyExpense: monthTotals.expense,
        monthlySavings: monthTotals.income - monthTotals.expense,
        categoryBreakdown,
        recentTransactions,
        budgetStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthly = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const rows = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
    ]);

    const result = [];
    for (let m = 1; m <= 12; m++) {
      const monthRow = { month: m, name: monthNames[m - 1], income: 0, expense: 0, savings: 0 };
      for (const row of rows) {
        if (row._id.month !== m) continue;
        if (row._id.type === 'income') monthRow.income = row.total;
        if (row._id.type === 'expense') monthRow.expense = row.total;
      }
      monthRow.savings = monthRow.income - monthRow.expense;
      result.push(monthRow);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getCategoriesAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();
    const win = monthWindow(month, year);

    const rows = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: win.start, $lte: win.end } } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryDoc' } },
      { $unwind: '$categoryDoc' },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryDoc.name' },
          icon: { $first: '$categoryDoc.icon' },
          color: { $first: '$categoryDoc.color' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const total = rows.reduce((sum, row) => sum + row.total, 0);
    const data = rows.map((row) => ({
      ...row,
      percentage: total > 0 ? (row.total / total) * 100 : 0,
    }));

    res.json({ success: true, data, total });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentMethods = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();
    const win = monthWindow(month, year);

    const rows = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: win.start, $lte: win.end } } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const total = rows.reduce((sum, row) => sum + row.total, 0);
    const data = rows.map((row) => ({
      method: row._id,
      total: row.total,
      count: row.count,
      percentage: total > 0 ? (row.total / total) * 100 : 0,
    }));

    res.json({ success: true, data, total });
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const previousDate = new Date(year, month - 2, 1);
    const previousMonth = previousDate.getMonth() + 1;
    const previousYear = previousDate.getFullYear();

    const currentWin = monthWindow(month, year);
    const previousWin = monthWindow(previousMonth, previousYear);

    const currentRows = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: currentWin.start, $lte: currentWin.end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const previousRows = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: previousWin.start, $lte: previousWin.end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const current = sumByType(currentRows);
    const previous = sumByType(previousRows);

    const currentCount = currentRows.reduce((sum, row) => sum + row.count, 0);
    const previousCount = previousRows.reduce((sum, row) => sum + row.count, 0);

    const daysInMonth = new Date(year, month, 0).getDate();
    const avgDaily = current.expense / daysInMonth;

    const currentCategories = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: currentWin.start, $lte: currentWin.end } } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryDoc' } },
      { $unwind: '$categoryDoc' },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryDoc.name' },
          icon: { $first: '$categoryDoc.icon' },
          color: { $first: '$categoryDoc.color' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const previousCategories = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: previousWin.start, $lte: previousWin.end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    const previousMap = {};
    for (const row of previousCategories) {
      previousMap[String(row._id)] = row.total;
    }

    const currentTotal = currentCategories.reduce((sum, row) => sum + row.total, 0);
    const categories = currentCategories.map((row) => {
      const previousTotal = previousMap[String(row._id)] || 0;
      const changePercent = previousTotal > 0 ? ((row.total - previousTotal) / previousTotal) * 100 : 0;

      return {
        ...row,
        percentage: currentTotal > 0 ? (row.total / currentTotal) * 100 : 0,
        previousTotal,
        changePercent,
      };
    });

    const sixMonths = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(year, month - 1 - i, 1);
      sixMonths.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        name: monthNames[date.getMonth()],
        income: 0,
        expense: 0,
      });
    }

    const sixStart = new Date(sixMonths[0].year, sixMonths[0].month - 1, 1);
    const sixRows = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: sixStart, $lte: currentWin.end } } },
      { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
    ]);

    for (const row of sixRows) {
      for (const bucket of sixMonths) {
        if (bucket.month === row._id.month && bucket.year === row._id.year) {
          if (row._id.type === 'income') bucket.income = row.total;
          if (row._id.type === 'expense') bucket.expense = row.total;
        }
      }
    }

    const paymentRows = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: currentWin.start, $lte: currentWin.end } } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const paymentTotal = paymentRows.reduce((sum, row) => sum + row.total, 0);
    const paymentMethods = paymentRows.map((row) => ({
      method: row._id,
      total: row.total,
      count: row.count,
      percentage: paymentTotal > 0 ? (row.total / paymentTotal) * 100 : 0,
    }));

    const expenseChange = previous.expense > 0 ? ((current.expense - previous.expense) / previous.expense) * 100 : 0;
    const incomeChange = previous.income > 0 ? ((current.income - previous.income) / previous.income) * 100 : 0;

    res.json({
      success: true,
      data: {
        month,
        year,
        monthName: monthNames[month - 1],
        current: {
          income: current.income,
          expense: current.expense,
          savings: current.income - current.expense,
          count: currentCount,
          avgDaily,
        },
        previous: {
          income: previous.income,
          expense: previous.expense,
          savings: previous.income - previous.expense,
          count: previousCount,
        },
        change: {
          expensePercent: expenseChange,
          incomePercent: incomeChange,
        },
        categories,
        topCategories: categories.slice(0, 5),
        sixMonths,
        paymentMethods,
      },
    });
  } catch (error) {
    next(error);
  }
};
