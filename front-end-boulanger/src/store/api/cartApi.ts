import { baseApi } from './baseApi';
import { CartItem, ApiResponse } from '@/types/api';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<ApiResponse<CartItem[]>, void>({
      query: () => '/panier',
      providesTags: ['Cart'],
    }),
    
    addToCart: builder.mutation<ApiResponse<any>, {
      produit_id: number;
      quantite: number;
    }>({
      query: (data) => ({
        url: '/panier/ajouter',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    
    removeFromCart: builder.mutation<ApiResponse<any>, string>({
      query: (produitId) => ({
        url: `/panier/${produitId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    
    clearCart: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: '/panier',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;