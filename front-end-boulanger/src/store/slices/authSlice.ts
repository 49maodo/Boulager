import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    initializeAuth: (state) => {
      // const token = localStorage.getItem('bakery_token');
      // const userStr = localStorage.getItem('bakery_user');
      const token = state.token;
      const userStr = state.user ? JSON.stringify(state.user) : null;

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
        } catch (error) {
          // Clear invalid data
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("bakery_token");
          localStorage.removeItem("bakery_user");
        }
      }
    },
  },
});

export const { setCredentials, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
