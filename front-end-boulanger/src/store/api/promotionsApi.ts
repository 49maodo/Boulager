import { baseApi } from './baseApi';
import { Promotion, ApiResponse } from '@/types/api';

interface PromotionRequest {
  nom: string;
  description: string;
  type: 'POURCENTAGE' | 'MONTANT_FIXE' | 'ACHETEZ_X_OBTENEZ_Y';
  valeur_remise: number;
  date_debut: string;
  date_fin: string;
  produits_ids?: number[];
}

export const promotionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query<ApiResponse<Promotion[]>, void>({
      query: () => '/promotions',
      providesTags: ['Promotion'],
    }),
    
    getPromotion: builder.query<ApiResponse<Promotion>, number>({
      query: (id) => `/promotions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Promotion', id }],
    }),
    
    createPromotion: builder.mutation<ApiResponse<Promotion>, PromotionRequest>({
      query: (promotionData) => ({
        url: '/promotions',
        method: 'POST',
        body: promotionData,
      }),
      invalidatesTags: ['Promotion'],
    }),
    
    updatePromotion: builder.mutation<ApiResponse<Promotion>, {
      id: number;
      data: PromotionRequest;
    }>({
      query: ({ id, data }) => ({
        url: `/promotions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Promotion', id }],
    }),
    
    deletePromotion: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/promotions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Promotion'],
    }),
  }),
});

export const {
  useGetPromotionsQuery,
  useGetPromotionQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} = promotionsApi;