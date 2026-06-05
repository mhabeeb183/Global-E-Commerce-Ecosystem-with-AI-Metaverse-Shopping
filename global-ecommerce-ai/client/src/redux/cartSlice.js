import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      const existingItem = state.cartItems.find(
        (x) => x._id === item._id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({
          ...item,
          quantity: 1,
        });
      }
    },

    increaseQuantity: (state, action) => {
      const item = state.cartItems.find(
        (x) => x._id === action.payload
      );

      if (item) {
        item.quantity += 1;
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.cartItems.find(
        (x) => x._id === action.payload
      );

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.cartItems = state.cartItems.filter(
            (x) => x._id !== action.payload
          );
        }
      }
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;