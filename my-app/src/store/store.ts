// store.ts
import { configureStore } from "@reduxjs/toolkit";
import myTaskReducer from "../components/slices/myTaskSlice";

// Create the store
export const store = configureStore({
  reducer: {
    myTask: myTaskReducer,
  },
});

// Infer types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
