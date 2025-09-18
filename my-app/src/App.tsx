
import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { routing } from './components/router/routing';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from '@mui/x-date-pickers';

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

