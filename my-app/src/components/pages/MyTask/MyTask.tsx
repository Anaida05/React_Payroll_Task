import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyTask,
  setFilterApplied,
  updateStarStatus,
  FetchMyTaskParams,
  markTaskCompleted,
  undoTask,
  updateTaskProgress,
} from "../../slices/myTaskSlice";
import { addTask } from "../../slices/taskSlice";
import { AppDispatch } from "../../../store/store";
import toast from "react-hot-toast";
import {
  Button,
  CircularProgress,
  Tooltip,
  IconButton,
  Radio,
} from "@mui/material";
import { Star, StarBorder, CheckCircle } from "@mui/icons-material";
import styles from "./MyTask.module.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Loader from "../../shared/Loader/Loader";
import AddTaskModal from "../../shared/AddTaskModal";
import FilterTask from "./FilterTask";
import PercentageModal from "./PercentageModal";

dayjs.extend(relativeTime);

// Utility function to determine task status for styling
const getTaskStatusForStyling = (
  taskItem: Task
): "completed" | "overdue" | "pending" => {
  const status = taskItem.TaskStatus;

  // Check if task is completed
  if (typeof status === "number" && status === 100) {
    return "completed";
  } else if (
    typeof status === "string" &&
    (status.toLowerCase() === "completed" || status === "100")
  ) {
    return "completed";
  }

  // Check if task is overdue (pending and past due date)
  if (taskItem.TaskEndDate) {
    const dueDate = dayjs(taskItem.TaskEndDate);
    const now = dayjs();

    if (dueDate.isBefore(now, "day")) {
      return "overdue";
    }
  }

  // Default to pending
  return "pending";
};

interface Task {
  TaskId: number;
  Title: string;
  Description?: string;
  AssignedByUserName?: string;
  CreateDate?: string;
  TaskEndDate?: string;
  TaskStatus: number | string;
  Starred?: boolean;
  IsFavourite?: boolean;
  AssignedToUsers?: Array<{
    TaskStatus: string | number;
  }>;
  CompletionDate?: string;
  [key: string]: any; // Allow additional properties
}

const MyTask: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isPendingAccordionOpen, setIsPendingAccordionOpen] =
    useState<boolean>(true);
  const [isCompletedAccordionOpen, setIsCompletedAccordionOpen] =
    useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("My Task");
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<Set<number>>(new Set());
  const [newTaskModalOpen, setNewTaskModalOpen] = useState<boolean>(false);
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [percentageModalOpen, setPercentageModalOpen] =
    useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<any>({});

  const dispatch = useDispatch<AppDispatch>();

  const getCompletionTimeString = () => {
    return `Completed On: Today at ${dayjs().format("h:mm a")}`;
  };

  const handleNewTaskModalOpen = () => {
    setNewTaskModalOpen(true);
  };

  const handleNewTaskModalClose = () => {
    setNewTaskModalOpen(false);
  };

  const handleNewTaskSave = async () => {
    // Refresh the task list after adding a new task
    const params = getTaskParams();
    dispatch(fetchMyTask(params));
    setNewTaskModalOpen(false);
  };

  const handleFilterModalOpen = () => {
    setFilterModalOpen(true);
  };

  const handleFilterModalClose = () => {
    setFilterModalOpen(false);
  };

  const handleFilterApplied = (filters: any) => {
    setAppliedFilters(filters);
  };

  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...appliedFilters };

    // Handle special cases for related filters
    if (filterKey === "DateType") {
      delete newFilters.DateType;
      delete newFilters.FromCreatedDate;
      delete newFilters.ToCreatedDate;
    } else if (filterKey === "dateRange") {
      delete newFilters.FromCreatedDate;
      delete newFilters.ToCreatedDate;
    } else if (filterKey === "TaskType") {
      delete newFilters.TaskType;
    } else if (filterKey === "TaskTypeValue") {
      delete newFilters.TaskType;
    } else if (filterKey === "DueDate") {
      delete newFilters.DueDate;
    } else if (filterKey === "DueDateValue") {
      delete newFilters.DueDate;
    } else {
      delete newFilters[filterKey];
    }

    setAppliedFilters(newFilters);

    // Update the API call with remaining filters
    const params = getTaskParams();
    const updatedParams = { ...params, ...newFilters };
    dispatch(fetchMyTask(updatedParams));
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
    const params = getTaskParams();
    dispatch(fetchMyTask(params));
  };

  const handlePercentageClick = (taskItem: Task) => {
    setSelectedTask(taskItem);
    setPercentageModalOpen(true);
  };

  const handlePercentageModalClose = () => {
    setPercentageModalOpen(false);
    setSelectedTask(null);
  };

  const handlePercentageSelect = async (percentage: number) => {
    if (!selectedTask) return;

    try {
      await dispatch(
        updateTaskProgress({
          taskId: selectedTask.TaskId,
          progress: percentage,
        })
      );

      // Update the task progress in local state
      const updateTaskProgressInState = (prevTasks: Task[]) =>
        prevTasks.map((task) =>
          task.TaskId === selectedTask.TaskId
            ? { ...task, AssignedToUsers: [{ TaskStatus: percentage }] }
            : task
        );

      setPendingTasks(updateTaskProgressInState);
      setCompletedTasks(updateTaskProgressInState);
    } catch (error) {
      console.error("Error updating task progress:", error);
    }
  };

  const renderFilterChips = () => {
    const chips = [];

    // Date Type filter
    if (appliedFilters.DateType) {
      chips.push({
        key: "DateType",
        label: `By ${
          appliedFilters.DateType === "ModifiedDate"
            ? "ModifiedDate"
            : "CreatedDate"
        }`,
        type: "blue",
      });
    }

    // Date Range filter
    if (appliedFilters.FromCreatedDate && appliedFilters.ToCreatedDate) {
      const fromDate = dayjs(appliedFilters.FromCreatedDate).format(
        "DD MMM YYYY"
      );
      const toDate = dayjs(appliedFilters.ToCreatedDate).format("DD MMM YYYY");
      chips.push({
        key: "dateRange",
        label: `From ${fromDate} To ${toDate}`,
        type: "white",
      });
    }

    // Task Type filter
    if (appliedFilters.TaskType) {
      chips.push({
        key: "TaskType",
        label: `By Task Type`,
        type: "blue",
      });
      chips.push({
        key: "TaskTypeValue",
        label: appliedFilters.TaskType,
        type: "white",
      });
    }

    // Due Date filter
    if (appliedFilters.DueDate) {
      chips.push({
        key: "DueDate",
        label: `By Due Date`,
        type: "blue",
      });
      chips.push({
        key: "DueDateValue",
        label: appliedFilters.DueDate,
        type: "white",
      });
    }

    return chips;
  };

  const getTaskParams = (): FetchMyTaskParams => {
    const params: FetchMyTaskParams = {
      From: currentPage * itemsPerPage + 1,
      To: (currentPage + 1) * itemsPerPage,
      Search: debouncedSearch,
    };

    if (activeTab === "Starred") {
      params.IsFavourite = true;
    } else if (activeTab === "My Task") {
      params.IsFavourite = false;
    }

    return params;
  };

  const { task, totalCount, loading } = useSelector(
    (state: any) => state.myTask
  );

  // Load completed tasks from localStorage on component mount
  useEffect(() => {
    const savedCompletedTasks = localStorage.getItem("completedTasks");
    if (savedCompletedTasks) {
      try {
        const parsed = JSON.parse(savedCompletedTasks);
        setCompletedTasks(parsed);
      } catch (error) {
        console.error(
          "Failed to parse completed tasks from localStorage:",
          error
        );
      }
    }
  }, []);

  // Save completed tasks to localStorage whenever they change
  useEffect(() => {
    if (completedTasks.length > 0) {
      localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    }
  }, [completedTasks]);

  useEffect(() => {
    if (task && Array.isArray(task)) {
      const tasksWithStars = task.map((taskItem: Task) => ({
        ...taskItem,
        Starred: taskItem.IsFavourite,
      }));

      // All tasks from API are pending (since API doesn't return completed tasks)
      setPendingTasks(tasksWithStars);

      // If API returns empty results and filters are applied, clear localStorage completed tasks
      if (
        tasksWithStars.length === 0 &&
        Object.keys(appliedFilters).length > 0
      ) {
        setCompletedTasks([]);
        localStorage.removeItem("completedTasks");
      }
    } else {
      setPendingTasks([]);

      // If no tasks and filters are applied, clear localStorage completed tasks
      if (Object.keys(appliedFilters).length > 0) {
        setCompletedTasks([]);
        localStorage.removeItem("completedTasks");
      }
    }
  }, [task, appliedFilters]);

  useEffect(() => {
    if (activeTab === "My Task" || activeTab === "Starred") {
      const params = getTaskParams();
      dispatch(fetchMyTask(params));
    }
  }, [dispatch, itemsPerPage, currentPage, debouncedSearch, activeTab]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const handleTabChange = (tabName: string) => {
    if (tabName !== activeTab) {
      setActiveTab(tabName);
      setCurrentPage(0);
    }
  };

  const toggleStar = (taskItem: Task) => {
    const newStarredStatus = !taskItem.Starred;

    const updateTasks = (prevTasks: Task[]) => {
      if (activeTab === "My Task" && newStarredStatus) {
        return prevTasks.filter((t) => t.TaskId !== taskItem.TaskId);
      } else if (activeTab === "Starred" && !newStarredStatus) {
        return prevTasks.filter((t) => t.TaskId !== taskItem.TaskId);
      } else {
        return prevTasks.map((t) =>
          t.TaskId === taskItem.TaskId
            ? { ...t, Starred: newStarredStatus, IsFavourite: newStarredStatus }
            : t
        );
      }
    };

    setPendingTasks(updateTasks);
    setCompletedTasks(updateTasks);

    dispatch(
      updateStarStatus({
        TaskId: taskItem.TaskId,
        FieldName: "IsFavourite",
        IsMyTask: true,
        Value: newStarredStatus,
      })
    );
  };

  const handleCompleteTask = async (taskItem: Task, isChecked: boolean) => {
    // Add task to loading state
    setLoadingTasks((prev) => new Set(prev).add(taskItem.TaskId));

    try {
      if (isChecked) {
        await dispatch(
          markTaskCompleted({ taskId: taskItem.TaskId, isMyTask: true })
        );

        // Update UI after API call succeeds
        const newStatus = 100;
        const completionDate = getCompletionTimeString();
        setPendingTasks((prev) =>
          prev.filter((t) => t.TaskId !== taskItem.TaskId)
        );
        setCompletedTasks((prev) => [
          {
            ...taskItem,
            TaskStatus: newStatus,
            CompletionDate: completionDate,
          },
          ...prev,
        ]);
      } else {
        await dispatch(undoTask({ TaskId: taskItem.TaskId, IsMyTask: true }));

        // Update UI after API call succeeds
        const newStatus = 0;
        setCompletedTasks((prev) =>
          prev.filter((t) => t.TaskId !== taskItem.TaskId)
        );
        setPendingTasks((prev) => [
          { ...taskItem, TaskStatus: newStatus, CompletionDate: undefined },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Error in handleCompleteTask:", error);
      toast.error("Failed to update task status");
    } finally {
      // Remove task from loading state
      setLoadingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskItem.TaskId);
        return newSet;
      });
    }
  };
  const renderTaskItem = (taskItem: Task, isCompletedList: boolean) => {
    const isLoading = loadingTasks.has(taskItem.TaskId);

    return (
      <div key={taskItem.TaskId} className={styles.taskItem}>
        {isLoading ? (
          <CircularProgress size={20} className={styles.checkbox} />
        ) : isCompletedList ? (
          // Completed task - show checkmark icon that can be clicked to undo
          <Tooltip title="Click to undo task">
            <IconButton
              onClick={() => {
                handleCompleteTask(taskItem, false);
              }}
              size="small"
              style={{ padding: "4px" }}
            >
              <CheckCircle style={{ color: "#1976d2", fontSize: "20px" }} />
            </IconButton>
          </Tooltip>
        ) : (
          // Pending task - show radio button
          <Radio
            checked={false}
            onChange={(e) => {
              handleCompleteTask(taskItem, e.target.checked);
            }}
            className={styles.checkbox}
            disabled={isLoading}
          />
        )}

        {/* Left side: Title and time */}
        <div className={styles.taskLeft}>
          <div
            className={`${styles.taskTitle} ${
              isCompletedList &&
              !taskItem.Title.toLowerCase().includes("pending")
                ? styles.completedNonPending
                : ""
            }`}
          >
            {taskItem.Title}
          </div>
          {/* Show description only for pending tasks */}
          {!isCompletedList && taskItem.Description && (
            <div className={styles.taskDescription}>{taskItem.Description}</div>
          )}
          <div
            className={`${styles.taskTime} ${
              styles[getTaskStatusForStyling(taskItem) as keyof typeof styles]
            }`}
          >
            {isCompletedList
              ? taskItem.CompletionDate ||
                `Completed on: ${dayjs(taskItem.TaskEndDate).format(
                  "MMM DD, YYYY"
                )}`
              : dayjs(taskItem.TaskEndDate).fromNow()}
          </div>
        </div>

        {/* Right side: Progress, Star, Actions */}
        <div className={styles.taskRight}>
          {!isCompletedList && (
            <div
              className={styles.taskProgress}
              onClick={() => handlePercentageClick(taskItem)}
              style={{ cursor: "pointer" }}
              title="Click to update progress"
            >
              <span className={styles.progressPercentage}>
                {String(taskItem.AssignedToUsers?.[0]?.TaskStatus || 0)}%
              </span>
              <CircularProgress
                variant="determinate"
                value={parseFloat(
                  String(taskItem.AssignedToUsers?.[0]?.TaskStatus || "0")
                )}
                size={30}
                thickness={4}
              />
            </div>
          )}
          <IconButton
            onClick={() => toggleStar(taskItem)}
            className={styles.starButton}
            size="small"
          >
            {taskItem.Starred ? (
              <Star className={styles.starIconFilled} />
            ) : (
              <StarBorder className={styles.starIcon} />
            )}
          </IconButton>
          <div className={styles.taskActions}>
            <Tooltip title="Options">
              <Button className={styles.threeDots}>⋮</Button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.taskContainer}>
      <div className={styles.topBar}>
        <div className={styles.filterButton}>
          <Button variant="outlined" onClick={handleFilterModalOpen}>
            Filter
          </Button>
        </div>
        <div className={styles.searchAndAdd}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchBtn}
            placeholder="Search"
          />
          <Button
            sx={{ backgroundColor: "#5d78ff" }}
            className={styles.addButton}
            variant="contained"
            onClick={handleNewTaskModalOpen}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Applied Filters Display */}
      {Object.keys(appliedFilters).length > 0 && (
        <div className={styles.appliedFiltersContainer}>
          <div className={styles.filterChips}>
            {renderFilterChips().map((chip, index) => (
              <div
                key={index}
                className={`${styles.filterChip} ${styles[chip.type]}`}
                onClick={() => handleRemoveFilter(chip.key)}
              >
                <span className={styles.chipLabel}>{chip.label}</span>
                <span className={styles.chipClose}>×</span>
              </div>
            ))}
          </div>
          <div
            className={styles.clearAllFilters}
            onClick={handleClearAllFilters}
          >
            <span>Clear Filter</span>
            <span className={styles.clearIcon}>×</span>
          </div>
        </div>
      )}

      <div className={styles.tabContainer}>
        <div
          className={`${styles.tab} ${
            activeTab === "My Task" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("My Task")}
        >
          My Task
        </div>
        <div
          className={`${styles.tab} ${
            activeTab === "Assigned By Me" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("Assigned By Me")}
        >
          Assigned By Me
        </div>
        <div
          className={`${styles.tab} ${
            activeTab === "CC" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("CC")}
        >
          CC
        </div>
        <div
          className={`${styles.tab} ${
            activeTab === "Starred" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("Starred")}
        >
          Starred
        </div>
      </div>

      {(activeTab === "My Task" || activeTab === "Starred") && (
        <>
          {loading ? (
            <Loader />
          ) : (
            <>
              <div
                className={styles.accordionHeader}
                onClick={() =>
                  setIsPendingAccordionOpen(!isPendingAccordionOpen)
                }
              >
                <div className={styles.accordionTitle}>
                  <span className={styles.accordionIcon}>
                    {isPendingAccordionOpen ? "▼" : "►"}
                  </span>
                  <span>
                    {activeTab === "Starred"
                      ? "Starred Tasks"
                      : "Pending Tasks"}
                    ({pendingTasks?.length || 0})
                  </span>
                </div>
              </div>

              {isPendingAccordionOpen && (
                <div className={styles.taskList}>
                  {pendingTasks?.length > 0 ? (
                    pendingTasks?.map((taskItem: Task) =>
                      renderTaskItem(taskItem, false)
                    )
                  ) : (
                    <div className={styles.noDataMessage}>
                      <p>No pending tasks found</p>
                    </div>
                  )}
                </div>
              )}

              <hr
                style={{
                  margin: "10px 0",
                  border: "none",
                  borderTop: "1px solid #eee",
                }}
              />

              {activeTab === "My Task" && (
                <>
                  <div
                    className={styles.accordionHeader}
                    onClick={() =>
                      setIsCompletedAccordionOpen(!isCompletedAccordionOpen)
                    }
                  >
                    <div className={styles.accordionTitle}>
                      <span className={styles.accordionIcon}>
                        {isCompletedAccordionOpen ? "▼" : "►"}
                      </span>
                      <span>
                        Completed Tasks ({completedTasks?.length || 0})
                      </span>
                    </div>
                  </div>

                  {isCompletedAccordionOpen && (
                    <div
                      className={`${styles.taskList} ${styles.completedTaskList}`}
                    >
                      {completedTasks?.length > 0 ? (
                        completedTasks?.map((taskItem: Task) =>
                          renderTaskItem(taskItem, true)
                        )
                      ) : (
                        <div className={styles.noDataMessage}>
                          <p>No completed tasks found</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
      {activeTab === "Assigned By Me" && <div>Content for Assigned By Me</div>}
      {activeTab === "CC" && <div>Content for CC</div>}

      <div className={styles.pagination}></div>

      {/* Add Task Modal */}
      <AddTaskModal
        open={newTaskModalOpen}
        onClose={handleNewTaskModalClose}
        currentUserId={1248} // Replace with actual user ID
        onSuccess={handleNewTaskSave}
      />

      {/* Filter Modal */}
      {filterModalOpen && (
        <FilterTask
          closeModal={handleFilterModalClose}
          teamMembers={[]}
          onFiltersApplied={handleFilterApplied}
        />
      )}

      {/* Percentage Modal */}
      <PercentageModal
        open={percentageModalOpen}
        onClose={handlePercentageModalClose}
        onPercentageSelect={handlePercentageSelect}
        currentPercentage={
          selectedTask
            ? parseFloat(
                String(selectedTask.AssignedToUsers?.[0]?.TaskStatus || "0")
              )
            : 0
        }
        taskTitle={selectedTask?.Title || ""}
      />
    </div>
  );
};

export default MyTask;
