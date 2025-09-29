
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ADDTASK, MYTASK, STARRED_TASK_FIELD, UNDO_TASK, UPDATE_TASK_STATUS } from "../services/apiEndPoints";
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
export interface UpdateTaskStatusParams {
  TaskId: number;
  Status: 'Pending' | 'Completed';
  IsMyTask: boolean;
}
export interface UndoTaskParams {
  TaskId: number;
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


export const undoTask = createAsyncThunk(
  "task/undoTask",
  async (params: UndoTaskParams, { rejectWithValue, getState, dispatch }) => {
    try {
      const urlWithTaskId = `${UNDO_TASK}?taskId=${params.TaskId}`;
      const payload = {
        IsMyTask: params.IsMyTask,
      };
      
      console.log("Undo Task - URL:", urlWithTaskId);
      console.log("Undo Task - Payload:", payload);
      console.log("Undo Task - Params:", params);
      
      const response = await privatePost(urlWithTaskId, payload);
      console.log("Undo Task - Response:", response);
      
      toast.success("Task moved back to Pending");
      const state: any = getState();
      const currentParams = state.tasks.lastParams;
      console.log("Undo Task - Refreshing with params:", currentParams);
      dispatch(fetchMyTask(currentParams));
      return { taskId: params.TaskId };
    } catch (err: any) {
      console.error("Undo Task - Error:", err);
      toast.error("Failed to undo task.");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const markTaskCompleted = createAsyncThunk(
  "task/markTaskCompleted",
  async ({ taskId, isMyTask }: { taskId: number; isMyTask: boolean }, { dispatch, rejectWithValue, getState }) => {
    try {
      const urlWithTaskId = `${UPDATE_TASK_STATUS}?taskId=${taskId}`;
      const payload = {
        FieldName: "TaskStatus",
        Value: 100,
        IsMyTask: isMyTask
      };

      console.log("Mark Task Completed - URL:", urlWithTaskId);
      console.log("Mark Task Completed - Payload:", payload);
      
      const response = await privatePost(urlWithTaskId, payload);
      console.log("Mark Task Completed - Full Response:", response);
      console.log("Mark Task Completed - Response Data:", response.data);
      
      // Check if the API response indicates success or failure
      if (response.data.Status === 404 && response.data.Message === 'No Records') {
        console.warn("API returned No Records - task might not exist or already completed");
        // Don't treat this as an error, just log it
      }
      
      toast.success("Task moved to Completed");
      const state: any = getState();
      const currentParams = state.tasks.lastParams;
      dispatch(fetchMyTask(currentParams));
      return { taskId };
    } catch (err: any) {
      toast.error("Failed to mark task completed.");
      return rejectWithValue(err.response?.data || err.message);
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
    builder.addCase(markTaskCompleted.rejected, (state, action) => {
      state.error = true;
    });
    builder.addCase(undoTask.rejected, (state, action) => {
      state.error = true;
    });
  },
});

export const { resetFilters, setFilterApplied } = taskSlice.actions;
export default taskSlice.reducer;