import styles from "./Home.module.css";
import Navbar from "../shared/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../shared/Sidebar/Sidebar";
const HomeLayout = () => {
  return (
    <div className={styles.parentContainer}>
      <div className={styles.leftContainer}>
        <Sidebar />
      </div>
      <div className={styles.rightContainer}>
        <Navbar />
        <div className={styles.outletContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
