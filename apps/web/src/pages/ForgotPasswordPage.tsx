import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { Input } from '../components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { Mail, AlertCircle, CheckCircle, Loader2, Key } from 'lucide-react'

type MessageType = 'success' | 'error' | 'info'

interface MessageState {
  type: MessageType
  text: string
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<MessageState | null>(null)
  const [emailError, setEmailError] = useState('')
  const [isEmailValid, setIsEmailValid] = useState(false)
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
      setIsEmailValid(false)
    } else {
      setEmailError('')
      setIsEmailValid(!!value && validateEmail(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEmailValid) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await resetPassword(email)

      if (error) {
        // Handle specific error types
        let errorMessage = 'An unexpected error occurred. Please try again.'

        if (error.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('not found') || error.message.includes('no user')) {
          errorMessage = 'No account found with this email address.'
        } else if (error.message) {
          errorMessage = error.message
        }

        setMessage({ type: 'error', text: errorMessage })
      } else {
        setMessage({
          type: 'success',
          text: 'Password reset email sent! Check your inbox and follow the instructions to reset your password.'
        })

        // Clear form after successful submission
        setEmail('')
        setIsEmailValid(false)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again later.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Clear message when user starts typing again
  useEffect(() => {
    if (message && email) {
      setMessage(null)
    }
  }, [email, message])

  const getMessageIcon = (type: MessageType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'info':
        return <Mail className="w-5 h-5 text-blue-600" />
      default:
        return null
    }
  }

  const getMessageStyles = (type: MessageType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Reset Password</CardTitle>
          <p className="text-center text-slate-600 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  placeholder="Enter your email address"
                  className={`pr-10 ${emailError ? 'border-red-300 focus:border-red-500' : isEmailValid ? 'border-green-300 focus:border-green-500' : ''}`}
                  aria-describedby={emailError ? "email-error" : undefined}
                  aria-invalid={!!emailError}
                />
                {email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailError ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : isEmailValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {emailError && (
                <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {emailError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !isEmailValid}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-lg border ${getMessageStyles(message.type)}`}>
              <div className="flex items-start gap-3">
                {getMessageIcon(message.type)}
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:underline block w-full py-2"
              disabled={loading}
            >
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}