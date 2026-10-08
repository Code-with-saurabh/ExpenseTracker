const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate value, this already exists' });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((item) => item.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Server error';
  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
