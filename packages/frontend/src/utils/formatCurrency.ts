const formatter = new Intl.NumberFormat('fi-FI', {
  style: 'currency',
  currency: 'EUR',
});

export const formatCurrency = (
  number: number,
  hasAbbreviation?: boolean,
): string => {
  if (hasAbbreviation) {
    const isNumberPositive = number > 0 ? '+' : '';

    return `${isNumberPositive}${formatter.format(number)}`;
  }

  return formatter.format(number);
};

export const formatCurrencyAbbreviation = (num: number): string => {
  if (Math.abs(num) > 999) {
    return `${((Math.sign(num) * Math.abs(num)) / 1000)
      .toFixed(1)
      .replace(/(\.0+|0+)$/, '')}K €`;
  }

  return `${Math.sign(num) * Math.abs(num)} €`;
};
