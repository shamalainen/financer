import { subMonths } from 'date-fns';

import { DateFormat, formatDate } from '$utils/formatDate';

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const monthNamesAbbreviation = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const monthAgoDate = subMonths(new Date(), 1);
export const currentMonthAndYearInLongFormat = formatDate(
  new Date(),
  DateFormat.monthLong,
);
