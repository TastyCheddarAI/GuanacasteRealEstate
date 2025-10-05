import { useNavigate } from 'react-router-dom'
import { Users, Mail, Phone, Waves } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">Guanacaste Real</div>
                <div className="text-xs text-slate-400">Costa Rica's Gold Coast</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed max-w-md">
              The first AI-powered FSBO platform built exclusively for Costa Rica's Guanacaste region. Buy smarter. Sell faster. Save more.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">For Buyers</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/search')} className="hover:text-white transition-colors text-left">Search Properties</button></li>
              <li><button onClick={() => navigate('/free-listings')} className="hover:text-white transition-colors text-left">Free Listings</button></li>
              <li><button onClick={() => navigate('/saved')} className="hover:text-white transition-colors text-left">Saved Properties</button></li>
              <li><button onClick={() => navigate('/buying-process')} className="hover:text-white transition-colors text-left">Buying Process</button></li>
              <li><button onClick={() => navigate('/legal-guide')} className="hover:text-white transition-colors text-left">Legal Guide</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/list')} className="hover:text-white transition-colors text-left">List Free</button></li>
              <li><button onClick={() => navigate('/messages')} className="hover:text-white transition-colors text-left">Messages</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Realtor Pro</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/resources')} className="hover:text-white transition-colors text-left">Resources</button></li>
              <li><button onClick={() => navigate('/knowledge-base')} className="hover:text-white transition-colors text-left">Knowledge Base</button></li>
              <li><button onClick={() => navigate('/costa-rica-laws')} className="hover:text-white transition-colors text-left">Costa Rica Laws</button></li>
              <li><button onClick={() => navigate('/title-types')} className="hover:text-white transition-colors text-left">Title Types</button></li>
              <li><button onClick={() => navigate('/due-diligence')} className="hover:text-white transition-colors text-left">Due Diligence</button></li>
              <li><button onClick={() => navigate('/blog')} className="hover:text-white transition-colors text-left">Blog</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="text-sm text-slate-500">
              © 2025 Guanacaste Real. All rights reserved. Built with ❤️ for Costa Rica's Gold Coast.
            </div>
            <div className="flex items-center justify-start md:justify-end gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}