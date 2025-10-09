import { useNavigate } from 'react-router-dom'
import { Users, Mail, Phone, Home } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand Section - Full width on mobile, spans 2 cols on lg */}
          <div className="sm:col-span-2 lg:col-span-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl font-bold text-white">Guanacaste Real</div>
                <div className="text-xs text-slate-400">Costa Rica's Gold Coast</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-md text-center sm:text-left">
              The first AI-powered FSBO platform built exclusively for Costa Rica's Guanacaste region. Buy smarter. Sell faster. Save more.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                <Users className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Sections - Centered on mobile */}
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-white mb-4 text-base">For Buyers</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => navigate('/search')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Search Properties</button></li>
              <li><button onClick={() => navigate('/free-listings')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Free Listings</button></li>
              <li><button onClick={() => navigate('/saved')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Saved Properties</button></li>
              <li><button onClick={() => navigate('/buying-process')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Buying Process</button></li>
              <li><button onClick={() => navigate('/legal-guide')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Legal Guide</button></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-bold text-white mb-4 text-base">For Sellers</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => navigate('/list')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">List Free</button></li>
              <li><button onClick={() => navigate('/messages')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Messages</button></li>
              <li><a href="#" className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Success Stories</a></li>
              <li><a href="#" className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Realtor Pro</a></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-bold text-white mb-4 text-base">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => navigate('/resources')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Resources</button></li>
              <li><button onClick={() => navigate('/knowledge-base')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Knowledge Base</button></li>
              <li><button onClick={() => navigate('/costa-rica-laws')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Costa Rica Laws</button></li>
              <li><button onClick={() => navigate('/title-types')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Title Types</button></li>
              <li><button onClick={() => navigate('/due-diligence')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Due Diligence</button></li>
              <li><button onClick={() => navigate('/blog')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Blog</button></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-bold text-white mb-4 text-base">Featured Towns</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => navigate('/tamarindo')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Tamarindo</button></li>
              <li><button onClick={() => navigate('/nosara')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Nosara</button></li>
              <li><button onClick={() => navigate('/flamingo')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Flamingo</button></li>
              <li><button onClick={() => navigate('/playa-grande')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Playa Grande</button></li>
              <li><button onClick={() => navigate('/samara')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">Samara</button></li>
              <li><button onClick={() => navigate('/explore')} className="hover:text-white transition-colors block py-1 px-2 rounded hover:bg-slate-800 w-full text-center sm:text-left sm:w-auto">All Towns</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Centered on mobile */}
        <div className="border-t border-slate-800 pt-8">
          <div className="text-center">
            <div className="text-sm text-slate-500 mb-4">
              © 2025 Guanacaste Real. All rights reserved. Built with ❤️ for Costa Rica's Gold Coast.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-800">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-800">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-800">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}