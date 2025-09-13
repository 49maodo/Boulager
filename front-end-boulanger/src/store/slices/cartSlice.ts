import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types/api";
import { cartApi } from "@/store/api/cartApi";
import { logout } from "@/store/slices/authSlice.ts";

interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  total: 0,
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },

    // Actions pour synchronisation manuelle si nécessaire
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.total = action.payload.reduce((sum, item) => {
        const price = item.produit ? parseFloat(String(item.produit.prix)) : 0;
        return sum + price * item.quantite;
      }, 0);
    },

    clearLocalCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    // Écouter les réponses de l'API pour synchroniser le state local
    builder
      .addCase(logout, () => initialState)
      .addMatcher(cartApi.endpoints.getCart.matchFulfilled, (state, action) => {
        const cartItems = action.payload.data || [];
        state.items = cartItems;
        state.total = cartItems.reduce((sum, item) => {
          const price = item.produit
            ? parseFloat(String(item.produit.prix))
            : 0;
          return sum + price * item.quantite;
        }, 0);
      })
      // @ts-ignore
      .addMatcher(cartApi.endpoints.addToCart.matchFulfilled, (state) => {
        // Le panier sera re-synchronisé par getCart grâce aux tags RTK Query
      })
      // @ts-ignore
      .addMatcher(cartApi.endpoints.removeFromCart.matchFulfilled, (state) => {
        // Le panier sera re-synchronisé par getCart grâce aux tags RTK Query
      })

      .addMatcher(cartApi.endpoints.clearCart.matchFulfilled, (state) => {
        state.items = [];
        state.total = 0;
      });
  },
});

export const { toggleCart, setCartOpen, setCartItems, clearLocalCart } =
  cartSlice.actions;

export default cartSlice.reducer;
