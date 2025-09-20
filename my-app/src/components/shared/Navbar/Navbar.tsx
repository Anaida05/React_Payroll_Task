import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { useLocation, useNavigate } from "react-router-dom";
const Navbar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [userName] = useState<string>("Rijo Admin New"); 
const navigate = useNavigate()
const location = useLocation()
const handleLogout=()=>{
    localStorage.removeItem("token")
    navigate("/")
}
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedTime = `${hours % 12 || 12}:${
        minutes < 10 ? `0${minutes}` : minutes
      } ${ampm}`;
      setCurrentTime(formattedTime);
    };

    const interval = setInterval(updateTime, 60000);

    updateTime();

    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/attendance":
        return "Attendance";
      case "/mytask":
        return "My Task";
      case "/myteam":
        return "My Team";
      case "/deal":
        return "Deal";
      case "/mycustomers":
        return "Customers";
      default:
        return "My Task"; 
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbarStyle}>
        <span>{getPageTitle()}</span>
      </div>
      <div className={styles.centerSectionStyle}>
        <span>{currentTime}</span>
        <button className={styles.buttonStyle}>Punch Out</button>
        <button className={styles.buttonStyle} onClick={handleLogout}>Logout</button>
      </div>
      <div className={styles.rightSectionStyle}>
        <span>{userName}</span>
      </div>
    </div>
  );
};

export default Navbar;
