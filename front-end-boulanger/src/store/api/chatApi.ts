import { baseApi } from './baseApi';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<{ agent_name: string; session_id: string; response: string }, { agent_name: string; input: string }>({
      query: (data) => ({
        url: '/vizra-adk/interact',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const { useSendMessageMutation } = chatApi;
