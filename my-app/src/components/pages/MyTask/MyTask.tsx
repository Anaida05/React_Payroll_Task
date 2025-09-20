import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTask, setFilterApplied } from "../../slices/myTaskSlice";
import DataTable from "react-data-table-component";
import { fetchTeamMembers, UserId } from "../../../utils/utils";
import ReactPaginate from "react-paginate";
import AddTask from "./AddTask";
import FilterTask from "./FilterTask";
import { Button, Tooltip } from "@mui/material";
import { Archive, Delete, CheckCircleOutline } from "@mui/icons-material";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import PercentIcon from "@mui/icons-material/Percent";
import ArchiveModal from "../../shared/Modal/ArchiveModal";
import { privateGet, privatePost } from "../../services/privateRequest";
import {
  ACCEPT_TASK,
  ARCHIVE_TASK,
  DELETE_TASK,
  UPDATE_TASK,
} from "../../services/apiEndPoints";
import TaskCoverageModal from "../../shared/Modal/TaskCoverageModal";
import DeleteModal from "../../shared/Modal/DeleteModal";
import CompleteTaskModal from "../../shared/Modal/CompleteModal";
import { toast } from "react-hot-toast";
import styles from "./Mytask.module.css";
import classes from "../../../Pagination.module.css";
import TaskPercentageModal from "../../shared/Modal/TaskPercentageModal";
import dayjs from "dayjs";
import Loader from "../../shared/Loader/Loader";

// Types for task, params, and dispatch
interface Task {
  TaskId: number;
  Title: string;
  LeadName: string;
  AssignedByUserName: string;
  CreateDate: string;
  TaskEndDate: string;
  CompletedDate: string;
  Priority: string;
  TaskStatus: string;
}

interface MyTaskParams {
  From: number;
  FromDueDate: string;
  IsArchive: boolean;
  Priority: string;
  SortByDueDate: string;
  SortColumn: string;
  SortOrder: string;
  TaskStatus: string;
  Title: string;
  To: number;
  ToDueDate: string;
  UserId: string;
  UserIds: string;
}

const MyTask: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [addTask, setAddtask] = useState<boolean>(false);
  const [filterTask, setFilterTask] = useState<boolean>(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]); // You can define a type for team members if needed
  const userId = UserId();
  const taskParams: MyTaskParams = {
    From: currentPage * itemsPerPage + 1,
    FromDueDate: "",
    IsArchive: false,
    Priority: "",
    SortByDueDate: "",
    SortColumn: "",
    SortOrder: "",
    TaskStatus: "",
    Title: debouncedSearch,
    To: (currentPage + 1) * itemsPerPage,
    ToDueDate: "",
    UserId: userId ? userId[0] : "",
    UserIds: "",
  };

  const [archive, setArchive] = useState<boolean>(false);
  const [archiveId, setArchiveId] = useState<number | undefined>();
  const [taskCoverage, setTaskCoverage] = useState<boolean>(false);
  const [deleteTask, setDeleteTask] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const [updateTask, setUpdateTask] = useState<boolean>(false);
  const [updateValue, setUpdateValue] = useState<any>({}); // Define a proper type here
  const [taskPercentageOpen, setTaskPercentageOpen] = useState<boolean>(false);
  const [taskPercentageId, setTaskPercentageId] = useState<number | undefined>();

  const dispatch = useDispatch();

  // Archive
  const handleArchiveClick = (row: Task) => {
    setArchive(true);
    setArchiveId(row.TaskId);
  };

  const handleArchiveSubmit = async () => {
    const res = await privatePost(ARCHIVE_TASK, {
      IsArchive: true,
      TaskId: +archiveId!,
    });
    setArchive(false);
    dispatch(fetchMyTask(taskParams));
  };

  // Mark a task as completed
  const handleCompletTask = async (row: Task) => {
    try {
      const res = await privatePost(ACCEPT_TASK, {
        TaskId: row.TaskId,
        TaskStatusValue: 0,
      });
      toast.success(res.data.data.Message || "Task accepted");
    } catch (error) {
      console.log("error", error);
    }
    dispatch(fetchMyTask(taskParams));
  };

  // View task coverage
  const handleTaskCoverage = () => {
    setTaskCoverage(!taskCoverage);
  };

  // Delete a task
  const handleDeleteClick = (row: Task) => {
    setDeleteTask(true);
    setDeleteId(row.TaskId);
  };

  const handleDeleteSubmit = async () => {
    const res = await privateGet(`${DELETE_TASK}?taskId=${deleteId}`);
    toast.success("Task deleted successfully");
    setDeleteTask(false);
    dispatch(fetchMyTask(taskParams));
  };

  // Update a task
  const handleUpdateClick = (row: Task) => {
    setUpdateTask(true);
    setUpdateValue(row);
  };

  const handleUpdateTaskSubmit = async () => {
    const res = await privatePost(UPDATE_TASK, {
      TaskId: updateValue.TaskId,
      TaskStatusValue: updateValue.TaskStatus,
    });
    toast.success("Task Status Updated");
    setUpdateTask(false);
    dispatch(fetchMyTask(taskParams));
  };

  // Update Percentage of a task
  const handlePercentage = (row: Task) => {
    setTaskPercentageOpen(true);
    setTaskPercentageId(row.TaskId);
  };

  const handlePercentageSubmit = async (value: number) => {
    const res = await privatePost(UPDATE_TASK, {
      TaskId: taskPercentageId!,
      TaskStatusValue: value,
    });
    toast.success("Percentage of task updated");
    setTaskPercentageOpen(false);
    dispatch(fetchMyTask(taskParams));
  };

  const getTaskColumns = () => [
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
        row.CreateDate ? dayjs(row.CreateDate).format("DD MMM, YYYY") : "-",
      sortable: true,
    },
    {
      name: "Due Date",
      selector: (row: Task) =>
        row.TaskEndDate ? dayjs(row.CompletedDate).format("DD MMM, YYYY") : "-",
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
            <Button onClick={() => handleArchiveClick(row)}>
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
            <Button onClick={() => handleCompletTask(row)}>
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
            <Button onClick={() => handleTaskCoverage()}>
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
            <Button onClick={() => handleDeleteClick(row)}>
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
            <Button onClick={() => handleUpdateClick(row)}>
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

  const { task, totalCount, loading, lastParams, filterApplied } = useSelector(
    (state: any) => state.myTask
  );

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const handleAddTask = () => {
    setAddtask(!addTask);
  };

  const closeModal = () => {
    setAddtask(false);
  };

  const handleFilterTask = () => {
    setFilterTask(!filterTask);
  };

  const closeFilterTask = () => {
    setFilterTask(false);
  };

  const getMembers = async () => {
    const members = await fetchTeamMembers(1, 10); // Fetch members from 1 to 10
    setTeamMembers(members);
  };

  useEffect(() => {
    getMembers();
  }, [addTask]);

  const handleClearFilters = () => {
    dispatch(
      fetchMyTask({
        ...lastParams,
        UserIds: "",
        TaskStatus: "",
        Priority: "",
        FromDueDate: "",
        ToDueDate: "",
      })
    );
    dispatch(setFilterApplied(false));
  };

  useEffect(() => {
    dispatch(fetchMyTask(taskParams));
  }, [dispatch, itemsPerPage, currentPage, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  return (
    <>
      <div className={styles.inputButton}>
        <button className={styles.addButton} onClick={handleAddTask}>
          Add Task
        </button>
        <button className={styles.addButton} onClick={handleFilterTask}>
          Filter
        </button>
        {filterApplied && (
          <button className={styles.addButton} onClick={handleClearFilters}>
            Cancel Filter
          </button>
        )}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchBtn}
          placeholder="search"
        />
      </div>
      {loading ? <Loader /> : <DataTable columns={getTaskColumns()} data={task} />}
      <div className={styles.paginationDiv}>
        <div className="pagination-controls">
          <label htmlFor="itemsPerPage">Items per page: </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          <ReactPaginate
            previousLabel={"← Previous"}
            nextLabel={"Next →"}
            pageCount={Math.ceil(totalCount / itemsPerPage)}
            onPageChange={handlePageChange}
            containerClassName={classes.pagination}
            activeClassName={classes.active}
            breakLabel={"..."}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
          />
        </div>
      </div>
      {addTask && <AddTask closeModal={closeModal} teamMembers={teamMembers} />}
      {filterTask && <FilterTask closeModal={closeFilterTask} teamMembers={teamMembers} />}
      <ArchiveModal
        open={archive}
        handleClose={() => setArchive(false)}
        handleSubmit={handleArchiveSubmit}
      />
      <TaskCoverageModal
        open={taskCoverage}
        handleClose={() => setTaskCoverage(false)}
      />
      <DeleteModal
        open={deleteTask}
        handleClose={() => setDeleteTask(false)}
        handleSubmit={handleDeleteSubmit}
      />
      <CompleteTaskModal
        open={updateTask}
        handleClose={() => setUpdateTask(false)}
        handleSubmit={handleUpdateTaskSubmit}
      />
      <TaskPercentageModal
        open={taskPercentageOpen}
        handleClose={() => setTaskPercentageOpen(false)}
        handleSubmit={handlePercentageSubmit}
      />
    </>
  );
};

export default MyTask;
