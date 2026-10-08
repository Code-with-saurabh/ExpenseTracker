const SavingsGoal = require('../models/SavingsGoal');
const { goalReached } = require('../utils/notify');
const { toAmount } = require('../utils/sanitize');

const withPercentage = (goal) => {
  const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  return { ...goal.toObject(), percentage };
};

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: goals.map(withPercentage) });
  } catch (error) {
    next(error);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, targetDate, description, icon } = req.body;

    const validTarget = toAmount(targetAmount);
    if (validTarget === null) {
      return res.status(400).json({ success: false, message: 'Please provide a valid target amount greater than 0' });
    }

    const validCurrent = Number(currentAmount || 0);
    if (!Number.isFinite(validCurrent) || validCurrent < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid saved amount' });
    }

    const goal = await SavingsGoal.create({
      user: req.user.id,
      title,
      targetAmount: validTarget,
      currentAmount: validCurrent,
      targetDate: targetDate || null,
      description: description || '',
      icon,
    });

    res.status(201).json({ success: true, data: withPercentage(goal) });
  } catch (error) {
    next(error);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const { title, targetAmount, targetDate, description, icon } = req.body;
    if (title) goal.title = title;
    if (targetAmount !== undefined) {
      const validTarget = toAmount(targetAmount);
      if (validTarget === null) {
        return res.status(400).json({ success: false, message: 'Please provide a valid target amount greater than 0' });
      }
      goal.targetAmount = validTarget;
    }
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (description !== undefined) goal.description = description;
    if (icon) goal.icon = icon;

    await goal.save();
    res.json({ success: true, data: withPercentage(goal) });
  } catch (error) {
    next(error);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addMoneyToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const validAmount = toAmount(amount);
    if (validAmount === null) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount greater than 0' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + validAmount);
    await goal.save();

    await goalReached(req.user.id, goal);

    res.json({ success: true, data: withPercentage(goal) });
  } catch (error) {
    next(error);
  }
};
