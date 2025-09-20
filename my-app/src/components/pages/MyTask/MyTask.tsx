import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTask, setFilterApplied } from "../../slices/myTaskSlice";
import { Button, CircularProgress, Tooltip, Checkbox, IconButton, Radio } from "@mui/material";
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
}

const MyTask: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("My Task");
  const [tasks, setTasks] = useState<Task[]>([]);

  const dispatch = useDispatch();

  const taskParams = {
    From: currentPage * itemsPerPage + 1,
    To: (currentPage + 1) * itemsPerPage,
    Title: debouncedSearch,
  };

  const { task, totalCount, loading } = useSelector((state: any) => state.myTask);

  useEffect(() => {
    if (task) {
      // Initialize tasks with starred status
      const tasksWithStars = task.map((taskItem: Task) => ({
        ...taskItem,
        Starred: false // Default to not starred
      }));
      setTasks(tasksWithStars);
    }
  }, [task]);

  useEffect(() => {
    if (activeTab === "My Task") {
      dispatch(fetchMyTask(taskParams));
    }
  }, [dispatch, itemsPerPage, currentPage, debouncedSearch, activeTab]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  const toggleStar = (taskId: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.TaskId === taskId ? { ...task, Starred: !task.Starred } : task
      )
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
          <Button className={styles.addButton} variant="contained">
            Add Task
          </Button>
        </div>
      </div>

      {/* Tab Navigation Header */}
      <div className={styles.tabContainer}>
        <div
          className={`${styles.tab} ${activeTab === "My Task" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("My Task")}
        >
          My Task
        </div>
        <div
          className={`${styles.tab} ${activeTab === "Assigned By Me" ? styles.activeTab : ""}`}
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
          className={`${styles.tab} ${activeTab === "Starred" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("Starred")}
        >
          Starred
        </div>
      </div>

      {/* Conditionally render content based on activeTab */}
      {activeTab === "My Task" && (
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
                  <span className={styles.accordionIcon}>{isAccordionOpen ? "▼" : "►"}</span>
                  <span>Pending Tasks({tasks?.length || 0})</span>
                </div>
              </div>

              {/* Task List (conditionally rendered) */}
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

                      {/* Right side: Star icon, Progress circle and actions */}
                      <div className={styles.taskRight}>                     
                        <div className={styles.taskProgress}>
                          <span className={styles.progressPercentage}>{taskItem.TaskStatus}%</span>
                          <CircularProgress
                            variant="determinate"
                            value={parseFloat(taskItem.TaskStatus || "0")}
                            size={30}
                            thickness={4}
                            className={styles.circularProgress}
                          />
                        </div>
                        <IconButton 
                          onClick={() => toggleStar(taskItem.TaskId)}
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

      <div className={styles.pagination}>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default MyTask;