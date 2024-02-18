export const parseErrorMessagesToArray = (
  error?: string | string[],
): string[] => {
  if (typeof error === 'undefined') return ['Unknown error.'];

  return typeof error === 'string' ? [error] : error;
};
