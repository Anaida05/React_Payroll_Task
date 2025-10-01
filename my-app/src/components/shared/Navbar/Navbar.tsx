import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { useLocation, useNavigate } from "react-router-dom";
const Navbar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
const navigate = useNavigate()
const location = useLocation()
const handleLogout=()=>{
    localStorage.removeItem("token")
    navigate("/login")
}
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      
      // Update time
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedTime = `${hours % 12 || 12}:${
        minutes < 10 ? `0${minutes}` : minutes
      } ${ampm}`;
      setCurrentTime(formattedTime);
      
      // Update date
      const options: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      };
      const formattedDate = now.toLocaleDateString('en-US', options);
      setCurrentDate(formattedDate);
    };

    const interval = setInterval(updateTimeAndDate, 60000);

    updateTimeAndDate();

    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/dashboard":
        return "Dashboard";
      case "/attendance":
        return "Attendance";
      case "/mytask":
        return "My Task";
      case "/myteam":
        return "My Team";
      case "/deals":
        return "Deal & Pipeline";
      case "/mycustomers":
        return "My Customers";
      default:
        return "Dashboard"; 
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbarStyle}>
        <span>{getPageTitle()}</span>
      </div>
      <div className={styles.centerSectionStyle}>
        <span>{currentTime}</span>
        <span className={styles.dateSeparator}>|</span>
        <span>{currentDate}</span>
        <button className={styles.buttonStyle}>Punch Out</button>
        <button className={styles.buttonStyle} onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
