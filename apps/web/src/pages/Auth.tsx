import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@guanacaste-real/ui'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to the intended page or home
        const from = (location.state as any)?.from?.pathname || '/'
        navigate(from, { replace: true })
      } else {
        // If not authenticated, redirect to login
        navigate('/login', { replace: true })
      }
    }
  }, [user, loading, navigate, location])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authenticating...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we verify your authentication.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  )
}