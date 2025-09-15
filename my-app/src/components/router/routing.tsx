import  { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from '../routes/PrivateRoute';
import PublicRoute from '../routes/PublicRoutes';
import HomeLayout from '../HomeLayout/HomeLayout';


const Login = lazy(() => import('../pages/Login/Login'));
const Dashboard = lazy(()=> import("../pages/Dashboard/Dashboard"))
const MyTask = lazy(() => import('../pages/MyTask/MyTask'));

export const routing = createBrowserRouter([
  {
    path: '/login',
    element: <PublicRoute component={Login} />,
  },
  {
    path: '/',
    element: <PrivateRoute component={HomeLayout} />,
    children: [
      { path: '/dashboard', element: <Dashboard/> },
      { path: 'mytask', element: <MyTask /> },
    ],
  },
]);
