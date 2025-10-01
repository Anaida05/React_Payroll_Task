
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ADDTASK, ADD_TASK, TASK, STARRED_TASK_FIELD, ACCEPT_TASK, UPDATE_TASK_STATUS, UPDATE_TASK_FIELD } from "../services/apiEndPoints";
import { privatePost, privatePut } from "../services/privateRequest";
import toast from "react-hot-toast";

interface Task {
  TaskId: number;
  Title: string;
  AssignedByUserName: string;
  CreateDate: string;
  TaskStatus: number;
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
  Search?: string;
  IsFavourite?: boolean;
  TaskType?: string;
  DateType?: string;
  FromCreatedDate?: string;
  ToCreatedDate?: string;
  DueDate?: string;
  FromDueDate?: string;
  ToDueDate?: string;
  IsTarget?: boolean | null;
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
    const res = await privatePost(TASK, params);
    return {data: res.data, params};
  }
);

export const addTask=createAsyncThunk("post/addTask",async(params, { rejectWithValue })=>{
  try {
    const res=await privatePost(ADD_TASK,params)
    toast.success("new task added successfully")
    return res.data
  } catch (error: any) {
    console.error("Add Task Error:", error);
    toast.error("Failed to add task");
    return rejectWithValue(error?.response?.data || "Failed to add task");
  }
})

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
      const payload = {
        TaskId: params.TaskId,
        TaskStatusValue: 0, // 0 represents Pending status
      };
      
      const response = await privatePost(UPDATE_TASK_STATUS, payload);      
      toast.success("Task moved back to Pending");
      
      // Don't refetch tasks - let the component handle the UI update
      return { taskId: params.TaskId };
    } catch (err: any) {
      console.error("Undo Task - Error:", err);
      toast.error("Failed to undo task.");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateTaskProgress = createAsyncThunk(
  "task/updateTaskProgress",
  async ({ taskId, progress }: { taskId: number; progress: number }, { rejectWithValue }) => {
    try {
      const urlWithTaskId = `${UPDATE_TASK_FIELD}?taskId=${taskId}`;
      const payload = {
        FieldName: "TaskStatus",
        Value: progress,
        IsMyTask: true,
      };
      
      const response = await privatePut(urlWithTaskId, payload);      
      toast.success(`Task progress updated to ${progress}%`);
      
      return { taskId, progress };
    } catch (err: any) {
      console.error("Update Task Progress - Error:", err);
      toast.error("Failed to update task progress.");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const markTaskCompleted = createAsyncThunk(
  "task/markTaskCompleted",
  async ({ taskId, isMyTask }: { taskId: number; isMyTask: boolean }, { dispatch, rejectWithValue, getState }) => {
    try {
      const payload = {
        TaskId: taskId,
        TaskStatusValue: 100,
      };
      
      const response = await privatePost(ACCEPT_TASK, payload);
      
      toast.success("Task moved to Completed");
      
      // Don't refetch tasks - let the component handle the UI update
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
  // Handle the actual API response structure
      const responseData: any = action.payload.data;
      
      if (responseData && responseData.Status === 200) {
        // API response structure: {Status: 200, Message: "Success", data: {...}}
        const apiData = responseData.data;
        
        if (apiData) {
          // Check for different possible task list properties
          const taskList = apiData.TaskList || apiData.Tasks || apiData.Pending || apiData.Completed || [];
          
          if (Array.isArray(taskList)) {
            state.task = taskList;
            state.totalCount = apiData.TotalRecords || apiData.TotalCount || taskList.length;
          } else if (apiData.Pending && apiData.Completed) {
            // If tasks are separated into Pending and Completed arrays
            const allTasks = [...(apiData.Pending || []), ...(apiData.Completed || [])];
            state.task = allTasks;
            state.totalCount = apiData.TotalRecords || apiData.TotalCount || allTasks.length;
          } else {
            // Fallback - try to find any array in the response
            const possibleArrays = Object.values(apiData).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              state.task = possibleArrays[0] as any[];
              state.totalCount = apiData.TotalRecords || apiData.TotalCount || (possibleArrays[0] as any[]).length;
            } else {
              state.task = [];
              state.totalCount = 0;
            }
          }
        } else {
          state.task = [];
          state.totalCount = 0;
        }
      } else {
        // Handle other response structures
        if (responseData && Array.isArray(responseData)) {
          state.task = responseData;
          state.totalCount = responseData.length;
        } else {
          state.task = [];
          state.totalCount = 0;
        }
      } 
      state.lastParams = action.payload.params;
    });
    builder.addCase(fetchMyTask.rejected, (state) => {
      (state.loading = false), (state.error = true);
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
    builder.addCase(updateTaskProgress.rejected, (state, action) => {
      state.error = true;
    });
    
    // Add Task cases
    builder.addCase(addTask.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(addTask.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      // Optionally refresh the task list after adding a new task
    });
    builder.addCase(addTask.rejected, (state) => {
      state.loading = false;
      state.error = true;
    });
  },
});

export const { resetFilters, setFilterApplied } = taskSlice.actions;
export default taskSlice.reducer;