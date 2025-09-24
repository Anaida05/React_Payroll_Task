import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTask, setFilterApplied, updateStarStatus, FetchMyTaskParams } from "../../slices/myTaskSlice";
import {
  Button,
  CircularProgress,
  Tooltip,
  IconButton,
  Radio,
} from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import styles from "./Mytask.module.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Loader from "../../shared/Loader/Loader";

dayjs.extend(relativeTime);

interface Task {
  TaskId: number;
  Title: string;
  AssignedByUserName: string;
  CreateDate: string;
  TaskStatus: string;
  Starred?: boolean;
  IsFavourite: boolean;
  AssignedToUsers?: Array<{
    TaskStatus: string;
  }>;
}

const MyTask: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("My Task");
  const [tasks, setTasks] = useState<Task[]>([]);

  const dispatch = useDispatch<any>();

  const getTaskParams = (): FetchMyTaskParams => {
    const params: FetchMyTaskParams = {
      From: currentPage * itemsPerPage + 1,
      To: (currentPage + 1) * itemsPerPage,
      Title: debouncedSearch,
    };

    // Explicitly filter tasks based on the active tab
    if (activeTab === "Starred") {
      params.IsFavourite = true; // Fetch only starred tasks
    } else if (activeTab === "My Task") {
      params.IsFavourite = false; // Fetch only non-starred tasks
    }

    return params;
  };

  const { task, totalCount, loading } = useSelector(
    (state: any) => state.myTask
  );

  useEffect(() => {
    if (task) {
      const tasksWithStars = task.map((taskItem: Task) => ({
        ...taskItem,
        Starred: taskItem.IsFavourite,
      }));
      setTasks(tasksWithStars);
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

    // 1. Optimistic Update/Removal of the task from the local list
    setTasks(prevTasks => {

      // Scenario 1: Starring a task while on the "My Task" tab
      // Condition: On My Task tab AND Starred status is becoming TRUE
      if (activeTab === "My Task" && newStarredStatus) {
        // REMOVE the task from the 'My Task' list immediately.
        return prevTasks.filter(t => t.TaskId !== taskItem.TaskId);
      }

      // Scenario 2: Unstarring a task while on the "Starred" tab
      // Condition: On Starred tab AND Starred status is becoming FALSE
      else if (activeTab === "Starred" && !newStarredStatus) {
        // REMOVE the task from the 'Starred' list immediately.
        return prevTasks.filter(t => t.TaskId !== taskItem.TaskId);
      }

      // Scenario 3: Default (only update local status/star icon)
      else {
        return prevTasks.map(t =>
          t.TaskId === taskItem.TaskId
            ? { ...t, Starred: newStarredStatus, IsFavourite: newStarredStatus }
            : t
        );
      }
    });

    // 2. Dispatch the async update (This triggers the Redux state update and re-fetch)
    dispatch(updateStarStatus({
      TaskId: taskItem.TaskId,
      FieldName: "IsFavourite",
      IsMyTask: true,
      Value: newStarredStatus
    }))
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
          <Button className={styles.addButton} variant="contained">
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
              {/* Accordion Header */}
              <div
                className={styles.accordionHeader}
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              >
                <div className={styles.accordionTitle}>
                  <span className={styles.accordionIcon}>
                    {isAccordionOpen ? "▼" : "►"}
                  </span>
                  <span>
                    {activeTab === "Starred" ? "Starred Tasks" : "Pending Tasks"}
                    ({tasks?.length || 0})
                  </span>
                </div>
              </div>

              {isAccordionOpen && (
                <div className={styles.taskList}>
                  {tasks?.map((taskItem: Task) => (
                    <div key={taskItem.TaskId} className={styles.taskItem}>
                      <Radio className={styles.checkbox} />

                      {/* Left side: Title and time */}
                      <div className={styles.taskLeft}>
                        <div className={styles.taskTitle}>{taskItem.Title}</div>
                        <div className={styles.taskTime}>
                          {dayjs(taskItem.CreateDate).fromNow()}
                        </div>
                      </div>

                      <div className={styles.taskRight}>
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
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
      {activeTab === "Assigned By Me" && <div>Content for Assigned By Me</div>}
      {activeTab === "CC" && <div>Content for CC</div>}

      <div className={styles.pagination}>
      </div>
    </div>
  );
};

export default MyTask;