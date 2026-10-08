const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: 100,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0.01,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },
    nextDate: {
      type: Date,
      required: [true, 'Next date is required'],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'credit_card', 'debit_card', 'bank_transfer', 'net_banking', 'other'],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);
