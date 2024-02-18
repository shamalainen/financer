import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const URL_PARAM_ARRAY_SEPARATOR = '|';

export const financerBaseQuery = fetchBaseQuery({
  baseUrl: '',
  paramsSerializer: (params) => {
    const formattedParams = Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => !!value)
        .map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(URL_PARAM_ARRAY_SEPARATOR) : value,
        ]),
    );

    return new URLSearchParams(formattedParams).toString();
  },
});
