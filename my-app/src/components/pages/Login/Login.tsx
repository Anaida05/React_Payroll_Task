import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import FormikControl from "../../shared/Formik/FormikControl";
import loginImage from "../../../assets/jpg/loginPage.jpg";
import ffcLogo from "../../../assets/png/FFCLogo.png";
import { LOGIN } from "../../services/apiEndPoints";
import publicRequest from "../../services/publicRequest";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

interface LoginFormValues {
  username: string;
  password: string;
}

const validationSchema = Yup.object({
  username: Yup.string()
    .matches(/^[0-9]+$/, "Only digits are allowed")
    .min(10, "Must be exactly 10 digits")
    .max(10, "Must be exactly 10 digits")
    .required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login: React.FC = () => {
  const navigate = useNavigate();

  const initialValues: LoginFormValues = {
    username: "",
    password: "",
  };

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
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
    } finally {
      setSubmitting(false);
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
            <img
              src={ffcLogo}
              alt="Login Visual"
              className={styles.loginPaper}
            />
            <div className={styles.overlayText}>
              <h4>Daily Employee Attendance tracking</h4>
              <p>
                Application allows you to monitor your employees Check-In,
                Check-Out time and attendance from anywhere and at any time.
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
              return (
                <Form>
                  <Box sx={{ mt: 1 }}>
                    <FormikControl
                      control="input"
                      label="Username"
                      name="username"
                      type="text"
                      placeholder="Enter username"
                    />

                    <FormikControl
                      control="input"
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      className={styles.signInButton}
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={!(formik.isValid && formik.dirty)}
                    >
                      {formik.isSubmitting ? (
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
