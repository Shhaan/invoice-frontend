import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalItemsCount: 0,
    totalPrice: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) =>
          item.product_id === action.payload.product_id &&
          (action.payload.customization
            ? item.customization === action.payload.customization
            : true)
      );

      const price = parseFloat(action.payload.price);

      if (existingItem) {
        existingItem.count += 1;
        existingItem.subtotal = parseFloat(
          (existingItem.count * existingItem.price).toFixed(2)
        );
      } else {
        state.items.push({
          ...action.payload,
          price: price, // Ensure price is a float
          count: 1,
          subtotal: price,
        });
      }

      state.totalPrice = state.items
        .reduce((acc, item) => acc + item.subtotal, 0)
        .toFixed(2);
      state.totalItemsCount = state.items.reduce((acc, item) => acc + 1, 0);
    },
    Increasecount: (state, action) => {
      const existingItem = state.items.find(
        (item) =>
          item.product_id === action.payload.product_id &&
          (action.payload.customization
            ? item.customization === action.payload.customization
            : true)
      );

      if (existingItem) {
        existingItem.count += 1;
        existingItem.subtotal = parseFloat(
          (existingItem.count * existingItem.price).toFixed(2)
        );
      }

      state.totalPrice = state.items
        .reduce((acc, item) => acc + item.subtotal, 0)
        .toFixed(2);
      state.totalItemsCount = state.items.reduce((acc, item) => acc + 1, 0);
    },
    Decreasecount: (state, action) => {
      const existingItem = state.items.find(
        (item) =>
          item.product_id === action.payload.product_id &&
          (action.payload.customization
            ? item.customization === action.payload.customization
            : true)
      );

      if (existingItem && existingItem.count > 1) {
        existingItem.count -= 1;
        existingItem.subtotal = parseFloat(
          (existingItem.count * existingItem.price).toFixed(2)
        );
      }

      state.totalPrice = state.items
        .reduce((acc, item) => acc + item.subtotal, 0)
        .toFixed(2);
      state.totalItemsCount = state.items.reduce((acc, item) => acc + 1, 0);
    },
    RemoveItem: (state, action) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.product_id === action.payload.product_id &&
            (action.payload.customization
              ? item.customization === action.payload.customization
              : true)
          )
      );

      state.totalPrice = state.items
        .reduce((acc, item) => acc + item.subtotal, 0)
        .toFixed(2);
      state.totalItemsCount = state.items.reduce((acc, item) => acc + 1, 0);
    },
    removecart: (state) => {
      state.totalItemsCount = 0;
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

export const {
  addToCart,
  Decreasecount,
  Increasecount,
  RemoveItem,
  removecart,
} = cartSlice.actions;
export default cartSlice.reducer;
