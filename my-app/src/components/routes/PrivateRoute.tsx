import React from 'react'
import { getToken } from '../../utils/utils';
import { Navigate } from 'react-router-dom';
interface PrivateRouteProps{
  children: React.ReactNode  
}
const PrivateRoute : React.FC<PrivateRouteProps> = ({children}) => {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace/>
}

export default PrivateRoute