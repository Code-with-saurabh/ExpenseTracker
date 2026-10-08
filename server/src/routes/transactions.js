const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  toggleFavorite,
  getFavoriteTransactions,
  uploadReceipt,
  exportCsv,
} = require('../controllers/transactionController');

const router = express.Router();

router.use(protect);

router.get('/csv', exportCsv);
router.get('/favorites', getFavoriteTransactions);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/:id', getTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/receipt', upload.single('receipt'), uploadReceipt);

module.exports = router;
