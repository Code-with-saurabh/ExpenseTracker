const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
} = require('../controllers/recurringController');

const router = express.Router();

router.use(protect);

router.get('/', getRecurringExpenses);
router.post('/', createRecurringExpense);
router.put('/:id', updateRecurringExpense);
router.delete('/:id', deleteRecurringExpense);
router.patch('/:id/toggle', toggleRecurringExpense);

module.exports = router;
