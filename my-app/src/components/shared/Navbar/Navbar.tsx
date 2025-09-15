import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/login');
  };

  return (
    <nav>
      <div className={styles.navDiv}>
        <div className={styles.navElement}>
          <p>Home</p>
        </div>
        <div className={styles.navElement}>
          <p>About</p>
        </div>
        <div className={styles.navElement}>
          <p>Contact Us</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
