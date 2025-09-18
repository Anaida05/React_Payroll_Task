import React from 'react'
import { getToken } from '../../utils/utils'
import { Navigate } from 'react-router-dom'

interface PublicRouteProps{
children : React.ReactNode}
const PublicRoute : React.FC<PublicRouteProps> = ({children}) => {
  return getToken() ? <Navigate to="/dashboard" replace/>: <>{children}</> 
}

export default PublicRoute;