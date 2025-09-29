import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTask, setFilterApplied, updateStarStatus, FetchMyTaskParams, markTaskCompleted, undoTask, } from "../../slices/myTaskSlice";
import {
  Button,
  CircularProgress,
  Tooltip,
  IconButton,
  Radio,
} from "@mui/material";
import { Star, StarBorder, CheckCircle } from "@mui/icons-material";
import styles from "./Mytask.module.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Loader from "../../shared/Loader/Loader";
import NewTaskModal from "./NewTaskModal";

dayjs.extend(relativeTime);

interface Task {
  TaskId: number;
  Title: string;
  AssignedByUserName: string;
  CreateDate: string;
  TaskStatus: number;
  Starred?: boolean;
  IsFavourite: boolean;
  AssignedToUsers?: Array<{
    TaskStatus: string;
  }>;
  CompletionDate?: string;
}

const MyTask: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isPendingAccordionOpen, setIsPendingAccordionOpen] = useState<boolean>(true);
  const [isCompletedAccordionOpen, setIsCompletedAccordionOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("My Task");
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<Set<number>>(new Set());
  const [newTaskModalOpen, setNewTaskModalOpen] = useState<boolean>(false);

  const dispatch = useDispatch<any>();

  const getCompletionTimeString = () => {
    return `Completed On: Today at ${dayjs().format('h:mm a')}`;
  };

  const handleNewTaskModalOpen = () => {
    setNewTaskModalOpen(true);
  };

  const handleNewTaskModalClose = () => {
    setNewTaskModalOpen(false);
  };

  const handleNewTaskSave = (taskData: any) => {
    console.log("New task data:", taskData);
    // Here you can integrate with your existing addTask functionality
    // For now, just close the modal
    setNewTaskModalOpen(false);
  };

  const getTaskParams = (): FetchMyTaskParams => {
    const params: FetchMyTaskParams = {
      From: currentPage * itemsPerPage + 1,
      To: (currentPage + 1) * itemsPerPage,
      Title: debouncedSearch,
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

  useEffect(() => {
    console.log("🔍 Raw tasks from Redux:", task);
    console.log("🔍 Pending tasks:", pendingTasks);
    console.log("🔍 Completed tasks:", completedTasks);
    
    if (task) {
      const tasksWithStars = task.map((taskItem: Task) => ({
        ...taskItem,
        Starred: taskItem.IsFavourite,
      }));

      const pending = tasksWithStars.filter((t: Task) => t.TaskStatus !== 100);
      const completed = tasksWithStars.filter((t: Task) => t.TaskStatus === 100);

      console.log("🔍 Filtered pending tasks:", pending);
      console.log("🔍 Filtered completed tasks:", completed);

      setPendingTasks(pending);
      setCompletedTasks(completed);
    }
  }, [task]);

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
        return prevTasks.filter(t => t.TaskId !== taskItem.TaskId);
      } else if (activeTab === "Starred" && !newStarredStatus) {
        return prevTasks.filter(t => t.TaskId !== taskItem.TaskId);
      } else {
        return prevTasks.map(t =>
          t.TaskId === taskItem.TaskId
            ? { ...t, Starred: newStarredStatus, IsFavourite: newStarredStatus }
            : t
        );
      }
    };

    setPendingTasks(updateTasks);
    setCompletedTasks(updateTasks);

    dispatch(updateStarStatus({
      TaskId: taskItem.TaskId,
      FieldName: "IsFavourite",
      IsMyTask: true,
      Value: newStarredStatus
    }))
  };

  const handleCompleteTask = async (taskItem: Task, isChecked: boolean) => {
    console.log("🚀 handleCompleteTask called:", { taskItem: taskItem.TaskId, title: taskItem.Title, isChecked });
    console.log("🚀 Current task status:", taskItem.TaskStatus);
    
    // Add task to loading state
    setLoadingTasks(prev => new Set(prev).add(taskItem.TaskId));
    
    try {
      if (isChecked) {
        console.log("Dispatching: markTaskCompleted", taskItem.TaskId);
        await dispatch(markTaskCompleted({ taskId: taskItem.TaskId, isMyTask: true }));
        
        // Only update UI after API call succeeds
        console.log("Moving task to completed:", taskItem.TaskId);
        const newStatus = 100;
        const completionDate = getCompletionTimeString();
        setPendingTasks(prev => prev.filter(t => t.TaskId !== taskItem.TaskId));
        setCompletedTasks(prev => [{ ...taskItem, TaskStatus: newStatus, CompletionDate: completionDate }, ...prev]);
        
      } else {
        console.log("Dispatching: undoTask", taskItem.TaskId);
        await dispatch(undoTask({ TaskId: taskItem.TaskId, IsMyTask: true }));
        
        // Only update UI after API call succeeds
        console.log("Moving task to pending:", taskItem.TaskId);
        const newStatus = 0;
        setCompletedTasks(prev => prev.filter(t => t.TaskId !== taskItem.TaskId));
        setPendingTasks(prev => [{ ...taskItem, TaskStatus: newStatus, CompletionDate: undefined }, ...prev]);
      }
    } catch (error) {
      console.error("Error in handleCompleteTask:", error);
      toast.error("Failed to update task status");
    } finally {
      // Remove task from loading state
      setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskItem.TaskId);
        return newSet;
      });
    }
  };
  const renderTaskItem = (taskItem: Task, isCompletedList: boolean) => {
    const isLoading = loadingTasks.has(taskItem.TaskId);
    console.log("📋 Rendering task:", { taskId: taskItem.TaskId, title: taskItem.Title, status: taskItem.TaskStatus, isCompletedList, isLoading });
    
    return (
      <div key={taskItem.TaskId} className={styles.taskItem}>
        {isLoading ? (
          <CircularProgress size={20} className={styles.checkbox} />
        ) : isCompletedList ? (
          // Completed task - show checkmark icon that can be clicked to undo
          <Tooltip title="Click to undo task">
            <IconButton
              onClick={() => {
                console.log("🎯 Checkmark clicked to undo task:", taskItem.TaskId);
                handleCompleteTask(taskItem, false);
              }}
              size="small"
              style={{ padding: '4px' }}
            >
              <CheckCircle style={{ color: '#1976d2', fontSize: '20px' }} />
            </IconButton>
          </Tooltip>
        ) : (
          // Pending task - show radio button
          <Radio
            checked={false}
            onChange={(e) => {
              console.log("🎯 Radio button clicked:", { taskId: taskItem.TaskId, title: taskItem.Title, checked: e.target.checked });
              handleCompleteTask(taskItem, e.target.checked);
            }}
            className={styles.checkbox}
            disabled={isLoading}
          />
        )}

      {/* Left side: Title and time */}
      <div className={styles.taskLeft}>
        <div className={styles.taskTitle}>{taskItem.Title}</div>
        <div className={styles.taskTime}>
          {isCompletedList
            ? taskItem.CompletionDate || `Completed on: ${dayjs(taskItem.CreateDate).format('MMM DD, YYYY')}`
            : dayjs(taskItem.CreateDate).fromNow()
          }
        </div>
      </div>

      {/* Right side: Progress, Star, Actions */}
      <div className={styles.taskRight}>
        {!isCompletedList && (
          <div className={styles.taskProgress}>
            <span className={styles.progressPercentage}>
              {taskItem.AssignedToUsers?.[0]?.TaskStatus}%
            </span>
            <CircularProgress
              variant="determinate"
              value={parseFloat(taskItem.AssignedToUsers?.[0]?.TaskStatus || "0")}
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
          <Button variant="outlined">Filter</Button>
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
            className={styles.addButton} 
            variant="contained"
            onClick={handleNewTaskModalOpen}
          >
            Add Task
          </Button>
        </div>
      </div>

      <div className={styles.tabContainer}>
        <div
          className={`${styles.tab} ${activeTab === "My Task" ? styles.activeTab : ""
            }`}
          onClick={() => handleTabChange("My Task")}
        >
          My Task
        </div>
        <div
          className={`${styles.tab} ${activeTab === "Assigned By Me" ? styles.activeTab : ""
            }`}
          onClick={() => handleTabChange("Assigned By Me")}
        >
          Assigned By Me
        </div>
        <div
          className={`${styles.tab} ${activeTab === "CC" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("CC")}
        >
          CC
        </div>
        <div
          className={`${styles.tab} ${activeTab === "Starred" ? styles.activeTab : ""
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
                onClick={() => setIsPendingAccordionOpen(!isPendingAccordionOpen)}
              >
                <div className={styles.accordionTitle}>
                  <span className={styles.accordionIcon}>
                    {isPendingAccordionOpen ? "▼" : "►"}
                  </span>
                  <span>
                    {activeTab === "Starred" ? "Starred Tasks" : "Pending Tasks"}
                    ({pendingTasks?.length || 0})
                  </span>
                </div>
              </div>

              {isPendingAccordionOpen && (
                <div className={styles.taskList}>
                  {pendingTasks?.map((taskItem: Task) => renderTaskItem(taskItem, false))}
                </div>
              )}

              <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #eee' }} />

              {activeTab === "My Task" && (
                <>
                  <div
                    className={styles.accordionHeader}
                    onClick={() => setIsCompletedAccordionOpen(!isCompletedAccordionOpen)}
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
                    <div className={`${styles.taskList} ${styles.completedTaskList}`}>
                      {console.log("🎯 Rendering completed tasks:", completedTasks)}
                      {completedTasks?.map((taskItem: Task) => renderTaskItem(taskItem, true))}
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

      <div className={styles.pagination}>
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        open={newTaskModalOpen}
        onClose={handleNewTaskModalClose}
        onSave={handleNewTaskSave}
      />
    </div>
  );
};

export default MyTask;
