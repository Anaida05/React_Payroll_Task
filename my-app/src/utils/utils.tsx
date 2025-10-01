// export const getToken = (): string | null => {
//   return localStorage.getItem('token');
// };

import { privateGet } from "../components/services/privateRequest";
import { COMPANY_MEMBERS } from "../components/services/apiEndPoints";
import { Button, Tooltip } from "@mui/material";
import {
  Archive,
  Delete,
  CheckCircleOutline,
} from "@mui/icons-material";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt"; // default export
import PercentIcon from "@mui/icons-material/Percent"; 
import { useState } from "react";

// Define types for Task, TeamMember, etc.
interface Task {
  TaskId: number;
  Title: string;
  LeadName: string;
  AssignedByUserName: string;
  CreateDate: string;
  TaskEndDate: string;
  Priority: string;
  TaskStatus: number;
}

interface TeamMember {
  UserId: number;
  Name: string;
}

interface FetchTeamMembersResponse {
  data: {
    Members: TeamMember[];
  };
}

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const UserId = (): string[] => {
  const userId = localStorage.getItem("UserId");
  return userId ? [JSON.parse(userId)] : [];
};

const handlePercentage = (row: Task): void => {
  console.log("row", row);
};

// Define columns with typed functions
export const getTaskColumns = () => [
  {
    name: "Title",
    selector: (row: Task) => row.Title,
    sortable: true,
  },
  {
    name: "Customer Name",
    selector: (row: Task) => row.LeadName,
    sortable: true,
  },
  {
    name: "Assigned By",
    selector: (row: Task) => row.AssignedByUserName,
    sortable: true,
  },
  {
    name: "Assigned Date",
    selector: (row: Task) =>
      row.CreateDate ? new Date(row.CreateDate).toLocaleDateString() : "-",
    sortable: true,
  },
  {
    name: "Due Date",
    selector: (row: Task) =>
      row.TaskEndDate ? new Date(row.TaskEndDate).toLocaleDateString() : "-",
    sortable: true,
  },
  {
    name: "Priority",
    selector: (row: Task) => row.Priority,
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: Task) => row.TaskStatus,
    sortable: true,
  },
  {
    name: "Archive",
    selector: (row: Task) =>
      row.TaskStatus !== 100 ? (
        <Tooltip title="Archive Task">
          <Button>
            <Archive />
          </Button>
        </Tooltip>
      ) : (
        "-"
      ),
  },
  {
    name: "Accept",
    selector: (row: Task) =>
      row.TaskStatus === -1 ? (
        <Tooltip title="Accept Task">
          <Button>
            <CheckCircleOutline />
          </Button>
        </Tooltip>
      ) : (
        "-"
      ),
  },
  {
    name: "Task Coverage",
    selector: (row: Task) =>
      row.TaskId ? (
        <Tooltip title="View Task Coverage">
          <Button>
            <SignalCellularAltIcon />
          </Button>
        </Tooltip>
      ) : (
        "-"
      ),
  },
  {
    name: "Delete",
    selector: (row: Task) =>
      row.TaskId ? (
        <Tooltip title="Delete Task">
          <Button>
            <Delete />
          </Button>
        </Tooltip>
      ) : (
        "-"
      ),
  },
  {
    name: "Complete",
    selector: (row: Task) =>
      row.TaskStatus !== 100 && row.TaskStatus !== -1 ? (
        <Tooltip title="Mark Task as Completed">
          <Button>
            <CheckCircleOutline />
          </Button>
        </Tooltip>
      ) : (
        "-"
      ),
  },
  {
    name: "Task Percentage",
    selector: (row: Task) =>
      row.TaskStatus !== 100 && row.TaskStatus !== -1 ? (
        <Tooltip title="Task Percentage">
          <Button onClick={() => handlePercentage(row)}>
            <PercentIcon />
          </Button>
        </Tooltip>
      ) : (
        "-"
      ),
  },
];

const paramsTeamMember = {
  from: 1,
  text: "",
  to: -1,
};

// Fetch team members with types
export const fetchTeamMembers = async (from = 1, to = 10): Promise<TeamMember[]> => {
  const res: FetchTeamMembersResponse = await privateGet(
    `${COMPANY_MEMBERS}?from=${from}&to=${to}`
  );
  return res.data.Members;
};

// Define priority and status types
export const priorities = [
  { label: "High Priority", value: "High" },
  { label: "Low Priority", value: "Low" },
];

export const status = [
  { label: "Accepted", value: "Accepted" },
  { label: "Not Accepted", value: "Not Accepted" },
  { label: "Partial Completed", value: "Partial Completed" },
  { label: "Completed", value: "Completed" },
];

export const setAccessToken = (token: string): void => {
  localStorage.setItem("token", token);
};
