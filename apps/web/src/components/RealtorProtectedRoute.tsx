import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface RealtorProtectedRouteProps {
  children: ReactNode
}

export default function RealtorProtectedRoute({ children }: RealtorProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    // Redirect to login with the current location as state
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile?.role !== 'realtor') {
    // Redirect to home if not a realtor
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}