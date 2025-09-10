import { baseApi } from './baseApi';
import { LoginRequest, LoginResponse, RegisterRequest, User, ApiResponse } from '@/types/api';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    register: builder.mutation<ApiResponse<any>, RegisterRequest>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    logout: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    
    getUser: builder.query<ApiResponse<User>, void>({
      query: () => ({
        url: '/user',
        method: 'POST',
      }),
      providesTags: ['User'],
    }),
    
    forgotPassword: builder.mutation<ApiResponse<any>, { email: string }>({
      query: (data) => ({
        url: '/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    resetPassword: builder.mutation<ApiResponse<any>, {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }>({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;