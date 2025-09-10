import { baseApi } from './baseApi';
import { Order, CreateOrderRequest, ApiResponse } from '@/types/api';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<ApiResponse<Order[]>, { per_page?: number }>({
      query: (params = {}) => ({
        url: '/commandes',
        params,
      }),
      providesTags: ['Order'],
    }),
    
    getOrder: builder.query<ApiResponse<Order>, number>({
      query: (id) => `/commandes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    
    createOrder: builder.mutation<ApiResponse<Order>, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/commandes',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    
    updateOrderStatus: builder.mutation<ApiResponse<Order>, {
      id: number;
      statut: 'en_attente' | 'confirmee' | 'en_preparation' | 'en_livraison' | 'livree' | 'annulee';
    }>({
      query: ({ id, statut }) => ({
        url: `/commandes/${id}`,
        method: 'PUT',
        body: { statut },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),
    
    cancelOrder: builder.mutation<ApiResponse<Order>, number>({
      query: (id) => ({
        url: `/commandes/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    
    deleteOrder: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/commandes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;