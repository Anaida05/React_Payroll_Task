import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Input from "../../shared/InputField/InputField";
import loginImage from "../../assets/jpg/login-page-slider1.jpg";
import ffcLogo from "../../assets/png/FFC-logo.png";
import { LOGIN } from "../../services/apiEndPoints";
import publicRequest from "../../services/publicRequest";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.scss";

const validationSchema = Yup.object({
  username: Yup.string()
    .matches(/^[0-9]+$/, "Only digits are allowed")
    .min(10, "Must be exactly 10 digits")
    .max(10, "Must be exactly 10 digits")
    .required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    username: "",
    password: "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const res = await publicRequest.post(LOGIN, values);
      const combined = `${values.username}:${values.password}`;
      const base64Encoded = btoa(combined);
      localStorage.setItem("UserId", res.data.userDetail.data.UserId);
      localStorage.setItem("token", base64Encoded);
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error occurred in login");
    }
  };

  return (
    <Box className={styles.loginContainer}>
      <Box className={styles.imageSection}>
        <img
          src={loginImage}
          alt="Login Visual"
          className={styles.loginImage}
        />
      </Box>

      <Box className={styles.formSection}>
        <Container maxWidth="xs">
          <div className={styles.loginAvatar}>
            <img src={ffcLogo} alt="Login Logo" className={styles.loginPaper} />
            <div className={styles.overlayText}>
              <h4>Daily Employee Attendance tracking</h4>
              <p>
                Monitor your employee’s Check-In, Check-Out time and attendance
                anytime from anywhere.
              </p>
            </div>
          </div>

          <Typography component="h1" variant="h5" className={styles.loginTitle}>
            Get Started with BETA Field Force
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {(formik) => {
              setLoader(formik.isSubmitting);
              return (
                <Form>
                  <Box sx={{ mt: 1 }}>
                    <Input
                      label="Username"
                      name="username"
                      type="text"
                      placeholder="Enter username"
                      required={true}
                    />

                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      required={true}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      className={styles.signInButton}
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={!(formik.isValid && formik.dirty)}
                    >
                      {loader ? (
                        <>
                          <CircularProgress
                            size={20}
                            color="secondary"
                            sx={{ mr: 1 }}
                          />
                          Signing In
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;
