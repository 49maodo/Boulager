import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL + '/api'}` ||'http://localhost:8000/api',
  prepareHeaders: (headers, { getState }) => {
    const state = (getState as () => RootState)();
    const token = state.auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Product', 'Category', 'Order', 'Cart', 'Promotion', 'Chat'],
  endpoints: () => ({}),
});
