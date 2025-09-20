import React from "react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";
import dashbordLogo from "../../../assets/svg/DashboardLogo.svg";
import myTaskLogo from "../../../assets/svg/TaskLogo.svg";
import teamLogo from "../../../assets/svg/TeamLogo.svg";
import customer from "../../../assets/svg/CustomerLogo.svg";
import attendance from "../../../assets/svg/AttendanceLogo.svg";
import deal from "../../../assets/svg/DealLogo.svg";

const Sidebar: React.FC = () => {
  return (
    <div className={styles.sidebar}>
      <h4 className={styles.logo}>Test Field Force</h4>
      <div className={styles.menu}>
        <div className={styles.menuItem}>
          <img src={dashbordLogo} className={styles.icon} alt="" />
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className={styles.menuItem}>
          <img src={myTaskLogo} className={styles.icon} alt="" />
          <Link to="/mytask">My Task</Link>
        </div>
        <div className={styles.menuItem}>
          <img src={teamLogo} className={styles.icon} alt="" />
          <Link to="/myteam">My Team</Link>
        </div>
        <div className={styles.menuItem}>
          <img src={customer} className={styles.icon} alt="" />
          <Link to="/mycustomers">My Customers</Link>
        </div>
        <div className={styles.menuItem}>
          <img src={attendance} className={styles.icon} alt="" />
          <Link to="/attendance">Attendance</Link>
        </div>
        <div className={styles.menuItem}>
          <img src={deal} className={styles.icon} alt="" />
          <Link to="/deals">Deal & Pipeline</Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
