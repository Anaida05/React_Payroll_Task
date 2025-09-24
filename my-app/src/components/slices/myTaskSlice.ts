
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ADDTASK, MYTASK, STARRED_TASK_FIELD } from "../services/apiEndPoints";
import { privatePost, privatePut } from "../services/privateRequest";
import toast from "react-hot-toast";

interface Task {
  TaskId: number;
  Title: string;
  AssignedByUserName: string;
  CreateDate: string;
  TaskStatus: string;
  Starred?: boolean;
  AssignedToUsers?: Array<{
    TaskStatus: string;
  }>;
  IsFavourite?: boolean;
}

interface TaskState {
  task: Task[];
  totalCount: number;
  loading: boolean;
  error: boolean;
  lastParams: Record<string, any>;
  filterApplied: boolean;
}

export interface FetchMyTaskParams {
  From: number;
  To: number;
  UserId?: string;
  Title: string;
  IsFavourite?: boolean;
}

interface AddTaskParams {
  Title: string;
  Description: string;
}
interface UpdatedStarStatus {
  TaskId: number;
  Value: boolean;
  FieldName: string;
  IsMyTask: boolean;
}

export const fetchMyTask = createAsyncThunk(
  "get/fetchMyTask",
  async (params: FetchMyTaskParams) => {
    const res = await privatePost(MYTASK, params);
    console.log("task", res);

    return { data: res?.data?.data?.Pending || [], params };
  }
);

export const addTask = createAsyncThunk(
  "post/addTask",
  async (params: AddTaskParams) => {
    const res = await privatePost(ADDTASK, params);
    toast.success("New task added successfully");
    return res;
  }
);

export const updateStarStatus = createAsyncThunk(
  "put/updatedStarredStatus",
  async (params: UpdatedStarStatus, { rejectWithValue, dispatch, getState }) => {
    try {
      const urlWithTaskId = `${STARRED_TASK_FIELD}?taskId=${params.TaskId}`;
      const payload = {
        FieldName: params.FieldName,
        IsMyTask: params.IsMyTask,
        Value: params.Value
      };
      await privatePut(urlWithTaskId, payload);
      toast.success(params.Value ? "Task added to Starred" : "Task removed from Starred");

      const state: any = getState();
      const currentParams = state.tasks.lastParams;
      dispatch(fetchMyTask(currentParams));

      return params;
    } catch (error: any) {
      toast.error("Failed to update star status.");
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState: TaskState = {
  task: [],
  totalCount: 0,
  loading: false,
  error: false,
  lastParams: {},
  filterApplied: false,
};

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
      state.task = action.payload.data;
      state.totalCount = action.payload.data.length;
      state.lastParams = action.payload.params;
    });
    builder.addCase(fetchMyTask.rejected, (state) => {
      state.loading = false;
      state.error = true;
    });
    builder.addCase(updateStarStatus.rejected, (state, action) => {
      state.error = true;
    });
  },
});

export const { resetFilters, setFilterApplied } = taskSlice.actions;
export default taskSlice.reducer;