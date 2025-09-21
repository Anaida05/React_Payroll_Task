// Auth
export const LOGIN = "account/authenticate";

// Task APIs
export const MYTASK = "Task/v1/TaskDetails";
export const ADDTASK = "Task/v1/AddTask";
export const DELETE_TASK = "Task/DeleteTask"; 
export const UPDATE_TASK_STATUS = "Task/UpdateTaskStatus"; 
export const STARRED_TASK_FIELD = "Task/v1/TaskStatus";
export const UNDO_TASK = "Task/v1/UndoTask";

// CRM
export const GET_ALL_LEADS = "CRM/Leads"; 

// Members
export const COMPANY_MEMBERS = (start: number, search: string) => {
  return `CompanyMembers?from=${start}&text=${encodeURIComponent(
    search
  )}&to=${start + 70}`;
};