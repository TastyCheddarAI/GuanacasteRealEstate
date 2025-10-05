import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@guanacaste-real/ui'
import { Input } from '@guanacaste-real/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@guanacaste-real/ui'
import { useAuth } from '../contexts/AuthContext'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await signUp(email)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the magic link!')
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('Check') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:underline"
            >
              Already have an account? Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}