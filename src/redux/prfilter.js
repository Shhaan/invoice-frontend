import { createSlice } from "@reduxjs/toolkit";

const productfilter = createSlice({
  name: "prfilter",
  initialState: {
    value: "",
  },
  reducers: {
    addvalue: (state, action) => {
      state.value = action.payload.value;
    },
  },
});

export const { addvalue } = productfilter.actions;
export default productfilter.reducer;
