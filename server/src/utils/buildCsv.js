const buildCsv = (transactions) => {
  const header = ['Date', 'Type', 'Description', 'Category', 'Amount', 'Payment Method', 'Tags', 'Notes'];
  const rows = [header.join(',')];

  for (const item of transactions) {
    const categoryName = item.category ? item.category.name : '';
    const values = [
      new Date(item.date).toISOString().slice(0, 10),
      item.type,
      item.description,
      categoryName,
      item.amount,
      item.paymentMethod,
      (item.tags || []).join(' | '),
      item.notes || '',
    ];

    const line = values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
    rows.push(line);
  }

  return rows.join('\n');
};

module.exports = buildCsv;
