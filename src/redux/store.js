import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import prfilter from "./prfilter";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    prfilter: prfilter,
  },
});

export default store;
