// import React from 'react'
// import Login from './pages/Login'
// import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// import { routing } from './router/routing'
// const App = () => {
//   return (
//     <>
    
//     <RouterProvider router={routing}/>
//     </>
//   )
// }
// export default App


import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { routing } from './components/router/routing';

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={routing} />
      </Suspense>
    </LocalizationProvider>
  );
};

export default App;

