const Notification = require('../models/Notification');

const createOnce = async (userId, type, title, message, key) => {
  const alreadySent = await Notification.findOne({ user: userId, key });
  if (alreadySent) return;

  await Notification.create({ user: userId, type, title, message, key });
};

const checkBudgets = async (userId, month, year, budgets) => {
  for (const item of budgets) {
    const categoryName = item.category ? item.category.name : 'Budget';

    if (item.percentage >= 100) {
      await createOnce(
        userId,
        'budget_exceeded',
        'Budget exceeded',
        `${categoryName} budget is over by ${Math.round(item.percentage - 100)}%`,
        `budget:${year}:${month}:${categoryName}:over`
      );
    } else if (item.percentage >= 80) {
      await createOnce(
        userId,
        'budget_warning',
        'Budget warning',
        `${categoryName} budget is ${Math.round(item.percentage)}% used`,
        `budget:${year}:${month}:${categoryName}:warn`
      );
    }
  }
};

const goalReached = async (userId, goal) => {
  if (goal.currentAmount < goal.targetAmount) return;

  await createOnce(
    userId,
    'goal_progress',
    'Goal reached',
    `You saved the full amount for "${goal.title}"`,
    `goal:${goal._id}:reached`
  );
};

const recurringPosted = async (userId, title, amount) => {
  await createOnce(
    userId,
    'recurring_due',
    'Recurring expense posted',
    `"${title}" of ${amount} was added to your transactions`,
    `recurring:${userId}:${title}:${Date.now()}`
  );
};

module.exports = { checkBudgets, goalReached, recurringPosted };
