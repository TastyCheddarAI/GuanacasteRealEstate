import { useNavigate } from 'react-router-dom'
import { Button } from '@guanacaste-real/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@guanacaste-real/ui'
import { changeLanguage, getCurrentLanguage } from '@guanacaste-real/lib'
import { useAuth } from '../contexts/AuthContext'
import { Home, Search, MessageSquare, Heart, BarChart3, Plus } from 'lucide-react'

export default function Header() {
  const currentLang = getCurrentLanguage()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getDashboardInfo = () => {
    if (!profile?.role) return null

    switch (profile.role) {
      case 'buyer':
        return { text: 'My Dashboard', path: '/user-dashboard' }
      case 'owner':
        return { text: 'Seller Dashboard', path: '/seller-dashboard' }
      case 'realtor':
        return { text: 'Realtor Dashboard', path: '/realtor-dashboard' }
      case 'admin':
        return { text: 'Admin Dashboard', path: '/admin-dashboard' }
      default:
        return null
    }
  }

  const dashboardInfo = getDashboardInfo()

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-slate-900">Guanacaste Real</div>
              <div className="text-xs text-slate-500">Costa Rica's Gold Coast</div>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => navigate('/free-listings')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <Search className="w-4 h-4" />
              Free Listings
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            {user && (
              <>
                <button
                  onClick={() => navigate('/saved')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <Heart className="w-4 h-4" />
                  Saved
                </button>
                <button
                  onClick={() => navigate('/messages')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </button>
                {dashboardInfo && (
                  <button
                    onClick={() => navigate(dashboardInfo.path)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {dashboardInfo.text}
                  </button>
                )}
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/list')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            List Property
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-200 hover:border-slate-300">
                  {profile?.full_name || user.email || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/saved')}>
                  Saved Properties
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/messages')}>
                  Messages
                </DropdownMenuItem>
                {dashboardInfo && (
                  <DropdownMenuItem onClick={() => navigate(dashboardInfo.path)}>
                    {dashboardInfo.text}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => navigate('/login')} className="border-slate-200 hover:border-slate-300">
              Login
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-slate-200 hover:border-slate-300">
                {currentLang.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>EN</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('es')}>ES</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}