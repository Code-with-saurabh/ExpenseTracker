const express = require('express');
const { protect } = require('../middleware/auth');
const { getGoals, createGoal, updateGoal, deleteGoal, addMoneyToGoal } = require('../controllers/goalController');

const router = express.Router();

router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/add-money', addMoneyToGoal);

module.exports = router;
