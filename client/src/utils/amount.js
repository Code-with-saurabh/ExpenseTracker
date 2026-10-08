export const sanitizeAmountInput = (value) => {
  let cleaned = String(value).replace(/[^0-9.]/g, '');

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  const [whole, decimal] = cleaned.split('.');
  if (decimal !== undefined) {
    cleaned = whole + '.' + decimal.slice(0, 2);
  }

  return cleaned;
};

export const isValidAmount = (value) => {
  const number = Number(value);
  return value !== '' && Number.isFinite(number) && number > 0;
};

export const amountErrorMessage = (value) => {
  if (value === '' || value === null || value === undefined) return 'Amount is required';
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Please enter a valid number';
  if (number <= 0) return 'Amount must be greater than 0';
  return '';
};
