import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../components/ui'
import { Input } from '../components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui'
import { useAuth, Profile } from '../contexts/AuthContext'
import { supabase } from '../contexts/AuthContext'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  phone_e164: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  locale: z.string().min(1, 'Locale is required'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone_e164: profile?.phone_e164 || '',
      locale: profile?.locale || 'en',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        phone_e164: profile.phone_e164 || '',
        locale: profile.locale,
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setLoading(true)
    setMessage('')

    const updateData: Partial<Profile> = {
      full_name: data.full_name,
      phone_e164: data.phone_e164 || null,
      locale: data.locale,
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Profile updated successfully!')
      // Optionally refetch profile
      window.location.reload() // Simple way to refresh
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <p>Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone_e164" className="block text-sm font-medium mb-1">
                Phone (E.164 format, e.g., +1234567890)
              </label>
              <Input
                id="phone_e164"
                {...register('phone_e164')}
                placeholder="+1234567890"
              />
              {errors.phone_e164 && (
                <p className="text-red-600 text-sm mt-1">{errors.phone_e164.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="locale" className="block text-sm font-medium mb-1">
                Locale
              </label>
              <select
                id="locale"
                {...register('locale')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
              {errors.locale && (
                <p className="text-red-600 text-sm mt-1">{errors.locale.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Role
              </label>
              <p className="text-gray-600">{profile?.role || 'buyer'}</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}