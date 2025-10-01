// store.ts
import { configureStore } from "@reduxjs/toolkit";
import myTaskReducer from "../components/slices/myTaskSlice";
import memberReducer from "../components/slices/memberSlice";
import taskReducer from "../components/slices/taskSlice";

// Create the store
export const store = configureStore({
  reducer: {
    myTask: myTaskReducer,
    member: memberReducer,
    task: taskReducer,
  },
});

// Infer types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
