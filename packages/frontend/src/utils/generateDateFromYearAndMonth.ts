export const generateDateFromYearAndMonth = (
  year: number,
  month: number,
): Date => new Date(`${year}-${month.toString().padStart(2, '0')}-01`);
