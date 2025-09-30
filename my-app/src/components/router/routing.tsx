import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "../routes/PrivateRoute";
import PublicRoute from "../routes/PublicRoutes";
import HomeLayout from "../HomeLayout/HomeLayout";
import Customers from "../../components/pages/Customers";
import Deal from "../../components/pages/Deal";
import Attendance from "../../components/pages/Attendance";
import MyTeam from "../../components/pages/MyTeam";

const Login = lazy(() => import("../pages/Login/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const MyTask = lazy(() => import("../pages/MyTask/MyTask"));

export const routing = createBrowserRouter([
  {
    path: "*",
    element: <div>Page Not Found</div>,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <HomeLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "mytask", element: <MyTask /> },
      { path: "myteam", element: <MyTeam /> },
      { path: "attendance", element: <Attendance /> },
      { path: "deals", element: <Deal /> },
      { path: "mycustomers", element: <Customers /> },
    ],
  },
]);
