
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ADDTASK, TASK, STARRED_TASK_FIELD, ACCEPT_TASK, UPDATE_TASK_STATUS } from "../services/apiEndPoints";
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
    console.log("API Response:", res.data);
    return {data: res.data, params};
  }
);

export const addTask=createAsyncThunk("post/addTask",async(params)=>{
  const res=await privatePost(ADDTASK,params)
  toast.success("new task added successfully")
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
      
      console.log("Undo Task - Payload:", payload);
      
      const response = await privatePost(UPDATE_TASK_STATUS, payload);
      console.log("Undo Task - Response:", response);
      
      toast.success("Task moved back to Pending");
      const state: any = getState();
      const currentParams = state.tasks.lastParams;
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
      const payload = {
        TaskId: taskId,
        TaskStatusValue: 100,
      };

      console.log("Mark Task Completed - Payload:", payload);
      
      const response = await privatePost(ACCEPT_TASK, payload);
      console.log("Mark Task Completed - Response:", response);
      
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
      console.log("Redux - Full payload:", action.payload);
      console.log("Redux - Data:", action.payload.data);
      
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
      
      console.log("Redux - Final task array:", state.task);
      console.log("Redux - Final total count:", state.totalCount);
      
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
  },
});

export const { resetFilters, setFilterApplied } = taskSlice.actions;
export default taskSlice.reducer;