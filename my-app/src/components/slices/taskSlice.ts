import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { privatePost, privatePut, privateGet } from "../services/privateRequest";
import {
  ADD_TASK,
  DELETE_TASK,
  TASK,
  UNDO_TASK,
  UPDATE_TASK_FIELD,
  UPDATE_TASK_STATUS,
} from "../services/apiEndPoints";
import toast from "react-hot-toast";

// ---------------- Types ----------------
export interface Task {
  TaskId: number;
  Title: string;
  Description?: string;
  IsFavourite: boolean;
  TaskStatus: string;
  CompletionPercentage: number;
  AssignedToUsers?: {
    Id: number;
    EmployeeNo: string;
    Name: string;
    TaskStatus: number;
    Target: number;
    TargetAchieved: number;
  }[];
  Priority?: string;
  TaskStartDate?: string;
  TaskEndDate?: string;
  AssignedByUserId?: number;
  AssignedByUserName?: string;
  TaskCommentCount?: number;
  TaskType?: string;
  TaskRecurring?: {
    Interval: number;
    ByWeekDays?: string | null;
    ByMonth: number;
    BySetPos: number;
    Time: string;
    Occurrence: number;
    EndDate?: string | null;
    IsActive: boolean;
    LastTaskId: number;
  };
  [key: string]: any;
}

interface TaskState {
  pendingTasks: Task[];
  completedTasks: Task[];
  totalCount: number;
  loading: boolean;
  hasError: string | null;
  filterData?: unknown;
}

const initialState: TaskState = {
  pendingTasks: [],
  completedTasks: [],
  totalCount: 0,
  loading: false,
  hasError: null,
};

// ---------------- Thunks ----------------
export const toggleTaskFavourite = createAsyncThunk<
  { taskId: number; value: boolean },
  { taskId: number; currentValue: boolean; isMyTask: boolean }
>(
  "task/toggleTaskFavourite",
  async ({ taskId, currentValue, isMyTask }, { rejectWithValue }) => {
    try {
      const response = await privatePut(
        `${UPDATE_TASK_FIELD}?taskId=${taskId}`,
        {
          FieldName: "IsFavourite",
          Value: !currentValue,
          IsMyTask: isMyTask,
        }
      );

      if (response.data?.Status !== 200) {
        throw new Error(response.data?.Message || "Failed to update favourite");
      }

      return { taskId, value: !currentValue };
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTasks = createAsyncThunk<
  { pendingTasks: Task[]; completedTasks: Task[]; totalCount: number },
  any
>("task/fetchTasks", async (payload, { rejectWithValue }) => {
  try {
    const response = await privatePost(TASK, payload);

    if (response.data?.Status !== 200) {
      return { pendingTasks: [], completedTasks: [], totalCount: 0 };
    }

    const apiData = response.data.data;

    return {
      pendingTasks: apiData?.Pending || [],
      completedTasks: apiData?.Completed || [],
      totalCount: apiData?.TotalRecords || 0,
    };
  } catch (error: any) {
    console.log(error);
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const addTask = createAsyncThunk<void, any>(
  "task/addTask",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      console.log("taskSlice - Received payload:", payload);
      
      // Send the payload directly to the API
      const response = await privatePost(ADD_TASK, payload);
      
      console.log("taskSlice - API Response:", response);
      
      toast.success("Task added successfully");
      
      // Optionally refresh tasks after adding
      // dispatch(fetchTasks(defaultTaskPayload));
    } catch (error: any) {
      console.log("taskSlice - Error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTask = createAsyncThunk<void, number>(
  "task/deleteTask",
  async (taskId, { dispatch, rejectWithValue }) => {
    try {
      await privateGet(DELETE_TASK + `?taskId=${taskId}`);
      toast.success("Task Deleted successfully");
      // dispatch(fetchTasks(defaultTaskPayload));
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk<void, any>(
  "task/updateTaskStatus",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      await privatePost(UPDATE_TASK_STATUS, data);
      toast.success("Task Status updated successfully");
      // dispatch(fetchTasks(defaultTaskPayload));
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTaskPercentage = createAsyncThunk<
  { taskId: number; value: number },
  { taskId: number; value: number; isMyTask: boolean }
>(
  "task/updateTaskPercentage",
  async ({ taskId, value, isMyTask }, { dispatch, rejectWithValue }) => {
    try {
      const res = await privatePut(
        `${UPDATE_TASK_FIELD}?taskId=${taskId}`,
        {
          FieldName: "TaskStatus",
          Value: value,
          IsMyTask: isMyTask,
        }
      );

      if (res?.data?.Status !== 200) {
        throw new Error(res?.data?.Message || "Failed to update percentage");
      }

      toast.success("Task progress updated successfully");
      // dispatch(fetchTasks(defaultTaskPayload));

      return { taskId, value };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const markTaskCompleted = createAsyncThunk<
  { taskId: number },
  { taskId: number; isMyTask: boolean }
>(
  "task/markTaskCompleted",
  async ({ taskId, isMyTask }, { dispatch, rejectWithValue }) => {
    try {
      const res = await privatePut(
        `${UPDATE_TASK_FIELD}?taskId=${taskId}`,
        {
          FieldName: "TaskStatus",
          Value: 100,
          IsMyTask: isMyTask,
        }
      );

      if (res?.data?.Status !== 200) {
        throw new Error(res?.data?.Message || "Failed to mark completed");
      }

      toast.success("Task moved to Completed");
      // dispatch(fetchTasks(defaultTaskPayload));
      return { taskId };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const undoTask = createAsyncThunk<
  void,
  { taskId: number; isMyTask: boolean }
>(
  "task/undoTask",
  async ({ taskId, isMyTask }, { dispatch, rejectWithValue }) => {
    try {
      await privatePut(
        `${UNDO_TASK}?taskId=${taskId}&isMyTask=${isMyTask}`
      );
      toast.success("Task moved back to Pending");
      // dispatch(fetchTasks(defaultTaskPayload));
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ---------------- Slice ----------------
const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setFilterData: (state, action: PayloadAction<any>) => {
      state.filterData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Toggle Favourite
      .addCase(toggleTaskFavourite.fulfilled, (state, action) => {
        const { taskId, value } = action.payload;
        const pendingTask = state.pendingTasks.find((t) => t.TaskId === taskId);
        if (pendingTask) pendingTask.IsFavourite = value;

        const completedTask = state.completedTasks.find(
          (t) => t.TaskId === taskId
        );
        if (completedTask) completedTask.IsFavourite = value;
      })

      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.hasError = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.hasError = null;
        state.pendingTasks = action.payload.pendingTasks;
        state.completedTasks = action.payload.completedTasks;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.hasError = action.error.message || null;
      })

      // Add Task
      .addCase(addTask.pending, (state) => {
        state.loading = true;
        state.hasError = null;
      })
      .addCase(addTask.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.hasError = action.error.message || null;
      })

      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTask.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.hasError = action.error.message || null;
      })

      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaskStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.hasError = action.error.message || null;
      })

      // Undo Task
      .addCase(undoTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(undoTask.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(undoTask.rejected, (state, action) => {
        state.loading = false;
        state.hasError = action.error.message || null;
      });
  },
});

export const { setFilterData } = taskSlice.actions;
export default taskSlice.reducer;
