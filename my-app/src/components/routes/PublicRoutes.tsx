import React from 'react'
import { getToken } from '../../utils/utils'
import { Navigate } from 'react-router-dom'

interface PublicRouteProps{
    component : React.ComponentType<any>
}
const PublicRoute : React.FC<PublicRouteProps> = ({component : Component}) => {
  return getToken() ? <Component/> : <Navigate to="/login"/>
}

export default PublicRoute;