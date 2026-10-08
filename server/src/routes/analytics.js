const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getDashboard,
  getMonthly,
  getCategoriesAnalytics,
  getPaymentMethods,
  getReports,
} = require('../controllers/analyticsController');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/monthly', getMonthly);
router.get('/categories', getCategoriesAnalytics);
router.get('/payment-methods', getPaymentMethods);
router.get('/reports', getReports);

module.exports = router;
