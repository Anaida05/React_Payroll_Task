import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ADDTASK, MYTASK } from "../services/apiEndPoints";
import { privatePost } from "../services/privateRequest";
import toast from "react-hot-toast";

interface Task {
  TaskId: number;
  Title: string;
}

interface TaskState {
  task: Task[];
  totalCount: number;
  loading: boolean;
  error: boolean;
  lastParams: Record<string, any>;
  filterApplied: boolean;
}

interface FetchMyTaskParams {
  From: number;
  To: number;
  UserId: string;
  Title: string;
}

export const fetchMyTask = createAsyncThunk(
  "get/fetchMyTask",
  async (params: FetchMyTaskParams) => {
    const res = await privatePost(MYTASK, params);
    return { data: res.data.data, params };
  }
);

interface AddTaskParams {
  Title: string;
  Description: string;
}

export const addTask = createAsyncThunk("post/addTask", async (params: AddTaskParams) => {
  const res = await privatePost(ADDTASK, params);
  toast.success("New task added successfully");
  return res;
});

const initialState: TaskState = {
  task: [],
  totalCount: 0,
  loading: false,
  error: false,
  lastParams: {},
  filterApplied: false,
};

// Task slice
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    resetFilters: (state) => {
      state.lastParams = {};
    },
    setFilterApplied: (state, action: PayloadAction<boolean>) => {
      state.filterApplied = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMyTask.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(fetchMyTask.fulfilled, (state, action) => {
      state.loading = false;
      state.task = action.payload.data.TaskList;
      state.totalCount = action.payload.data.TotalCount;
      state.lastParams = action.payload.params;
    });
    builder.addCase(fetchMyTask.rejected, (state) => {
      state.loading = false;
      state.error = true;
    });
  },
});

export const { resetFilters, setFilterApplied } = taskSlice.actions;
export default taskSlice.reducer;
