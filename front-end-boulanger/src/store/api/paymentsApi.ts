import { baseApi } from './baseApi';
import { ApiResponse } from '@/types/api';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    simulatePayment: builder.mutation<ApiResponse<any>, {
      commandeId: number;
      mode_paiement: 'wave' | 'om' | 'espece';
      numero_wave?: string;
      numero_om?: string;
    }>({
      query: ({ commandeId, ...paymentData }) => ({
        url: `/commandes/${commandeId}/payer`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Order'],
    }),
    
    getPaymentHistory: builder.query<ApiResponse<{
      commande: any;
      paiements: string;
      total_paiements: string;
      total_montant_paye: string;
    }>, number>({
      query: (commandeId) => `/commandes/${commandeId}/paiements`,
    }),
  }),
});

export const {
  useSimulatePaymentMutation,
  useGetPaymentHistoryQuery,
} = paymentsApi;