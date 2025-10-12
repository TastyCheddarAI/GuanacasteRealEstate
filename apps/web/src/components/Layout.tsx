import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { Search, MapPin, Home, Building, Palmtree, DollarSign, Bed, Bath, Maximize, Calendar, Heart, Share2, Phone, Mail, MessageSquare, Star, ChevronDown, ChevronRight, Menu, X, Globe, User, Bell, Filter, SlidersHorizontal, Grid3x3, List, Navigation, TrendingUp, Shield, Sparkles, Play, Camera, FileText, Check, Clock, Award, Users, ChevronLeft, ExternalLink } from 'lucide-react'
import { Button } from './ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui'
import { changeLanguage, getCurrentLanguage } from '../lib'
import { useAuth } from '../contexts/AuthContext'
import Footer from './Footer'
import InstallPrompt from './InstallPrompt'
import { PWAUpdateBanner, PWAInstallPrompt } from './PWAUpdateBanner'
import AIPropertyAssistant from './AIPropertyAssistant'
import SEO, { generateOrganizationStructuredData, generateWebsiteStructuredData } from './SEO'

export default function Layout() {
  const [scrollY, setScrollY] = useState(0)
  const [searchFocused, setSearchFocused] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [locale, setLocale] = useState('en')
  const [activeFilter, setActiveFilter] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 2000000])
  const [savedCount, setSavedCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const currentLang = getCurrentLanguage()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Listen for AI assistant open events
  useEffect(() => {
    const handleOpenAIAssistant = () => setAiAssistantOpen(true)
    window.addEventListener('openAIAssistant', handleOpenAIAssistant)
    return () => window.removeEventListener('openAIAssistant', handleOpenAIAssistant)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global SEO and Structured Data */}
      <SEO
        structuredData={generateOrganizationStructuredData()}
      />
      <SEO
        structuredData={generateWebsiteStructuredData()}
      />

      {/* Main Navigation */}
      <nav className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrollY > 100 ? 'shadow-lg' : 'shadow-md'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 leading-none">Guanacaste Real</div>
                <div className="text-xs text-slate-500 font-medium">Costa Rica's Gold Coast</div>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => navigate('/search')} className="text-slate-700 hover:text-cyan-600 font-semibold transition-colors duration-200">Buy</button>
              <button onClick={() => navigate('/list')} className="text-slate-700 hover:text-cyan-600 font-semibold transition-colors duration-200">Sell</button>
              <button onClick={() => navigate('/explore')} className="text-slate-700 hover:text-cyan-600 font-semibold transition-colors duration-200">Towns</button>
              <button onClick={() => navigate('/knowledge-base')} className="text-slate-700 hover:text-cyan-600 font-semibold transition-colors duration-200">Knowledge Base</button>
              <button onClick={() => navigate('/resources')} className="text-slate-700 hover:text-cyan-600 font-semibold transition-colors duration-200">Pricing</button>

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">{currentLang.toUpperCase()}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white">
                    <DropdownMenuItem onClick={() => changeLanguage('en')}>EN</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage('es')}>ES</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        {profile?.full_name || user.email || 'User'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                )}
                <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-all duration-200">
                  <Bell className="w-5 h-5 text-slate-600" />
                  {savedCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {savedCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setAiAssistantOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Assistant
                </button>
                <button onClick={() => navigate('/list')} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  List Property Free
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 shadow-xl">
            <div className="px-4 py-6 space-y-4">
              <button onClick={() => { navigate('/search'); setMenuOpen(false); }} className="block text-lg font-semibold text-slate-700 hover:text-cyan-600 transition-colors text-left">Buy</button>
              <button onClick={() => { navigate('/list'); setMenuOpen(false); }} className="block text-lg font-semibold text-slate-700 hover:text-cyan-600 transition-colors text-left">Sell</button>
              <button onClick={() => { navigate('/explore'); setMenuOpen(false); }} className="block text-lg font-semibold text-slate-700 hover:text-cyan-600 transition-colors text-left">Towns</button>
              <button onClick={() => { navigate('/knowledge-base'); setMenuOpen(false); }} className="block text-lg font-semibold text-slate-700 hover:text-cyan-600 transition-colors text-left">Knowledge Base</button>
              <button onClick={() => { navigate('/resources'); setMenuOpen(false); }} className="block text-lg font-semibold text-slate-700 hover:text-cyan-600 transition-colors text-left">Pricing</button>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-700 mb-2">Language</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${currentLang === 'en' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => changeLanguage('es')}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${currentLang === 'es' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    ES
                  </button>
                </div>
              </div>
              {user ? (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-700">{profile?.full_name || user.email || 'User'}</div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="block w-full text-left text-slate-700 hover:text-cyan-600 transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left text-slate-700 hover:text-cyan-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-slate-100 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all duration-300"
                >
                  Login
                </button>
              )}
              <button
                onClick={() => setAiAssistantOpen(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg mb-3 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI Assistant
              </button>
              <button onClick={() => navigate('/list')} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                List Property Free
              </button>
            </div>
          </div>
        )}
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <InstallPrompt />

      {/* PWA Components */}
      <PWAUpdateBanner />
      <PWAInstallPrompt />

      {/* AI Property Assistant Modal */}
      <AIPropertyAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </div>
  )
}