import React from "react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css"; 

const Sidebar: React.FC = () => {
  return (
    <div className={styles.sidebar}>
      <h4 className={styles.logo}>Task Manager</h4>
      <div className={styles.menu}>
        <div className={styles.menuItem}>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className={styles.menuItem}>
          <Link to="/mytask">My Task</Link>
        </div>
        <div className={styles.menuItem}>
          My Team
        </div>
        <div className={styles.menuItem}>
          Billing
        </div>
        <div className={styles.menuItem}>
          Settings
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
