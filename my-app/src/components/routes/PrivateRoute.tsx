import React from 'react'
import { getToken } from '../../utils/utils';
import { Navigate } from 'react-router-dom';
interface PrivateRouteProps{
    component: React.ComponentType<any>;
}
const PrivateRoute : React.FC<PrivateRouteProps> = ({component : Component}) => {
  return getToken() ? <Component/> : <Navigate to="/login"/>
}

export default PrivateRoute