// Auth
export const LOGIN = "account/authenticate";

// Task APIs
export const MYTASK = "Task/UserTasksAssignedToMe";
export const ADDTASK = "Task/AssignTask";
export const DELETE_TASK = "Task/DeleteTask"; 
export const UPDATE_TASK_STATUS = "Task/UpdateTaskStatus"; 
export const STARRED_TASK_FIELD = "Task/v1/TaskStatus";
export const ACCEPT_TASK = "Task/UpdateTaskStatus";

// CRM
export const GET_ALL_LEADS = "CRM/Leads"; 

// Members
export const COMPANY_MEMBERS = (start: number, search: string) => {
  return `CompanyMembers?from=${start}&text=${encodeURIComponent(
    search
  )}&to=${start + 70}`;
};