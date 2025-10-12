import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import HomeRoute from './routes/index'
import ListProperty from './pages/ListProperty'
import FreeListings from './pages/FreeListings'
import PropertyDetail from './pages/PropertyDetail'
import SellerDashboard from './pages/SellerDashboard'
import SearchResults from './pages/SearchResults'
import Messages from './pages/Messages'
import SavedProperties from './pages/SavedProperties'
import BuyingProcess from './pages/BuyingProcess'
import LegalGuide from './pages/LegalGuide'
import Tamarindo from './pages/Tamarindo'
import Nosara from './pages/Nosara'
import Flamingo from './pages/Flamingo'
import PlayaGrande from './pages/PlayaGrande'
import Samara from './pages/Samara'
import Explore from './pages/Explore'
import Auth from './pages/Auth'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import UserDashboard from './pages/UserDashboard'
import Resources from './pages/Resources'
import KnowledgeBase from './pages/KnowledgeBase'
import CostaRicaLaws from './pages/CostaRicaLaws'
import TitleTypes from './pages/TitleTypes'
import DueDiligence from './pages/DueDiligence'
import Blog from './pages/Blog'
import OwnerFeaturedPropertyDetail from './pages/OwnerFeaturedPropertyDetail'
import BuyerProtectedRoute from './components/BuyerProtectedRoute'
import RealtorProtectedRoute from './components/RealtorProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import RealtorDashboard from './pages/RealtorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { AuthProvider } from './contexts/AuthContext'
import './lib' // Initialize i18n

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeRoute />} />
            <Route path="home" element={<HomeRoute />} />
            <Route path="list" element={<ListProperty />} />
            <Route path="free-listings" element={<FreeListings />} />
            <Route path="property/:id" element={<PropertyDetail />} />
            <Route path="seller-dashboard" element={<SellerDashboard />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="messages" element={<Messages />} />
            <Route path="saved" element={<SavedProperties />} />
            <Route path="buying-process" element={<BuyingProcess />} />
            <Route path="legal-guide" element={<LegalGuide />} />
            <Route path="tamarindo" element={<Tamarindo />} />
            <Route path="nosara" element={<Nosara />} />
            <Route path="flamingo" element={<Flamingo />} />
            <Route path="playa-grande" element={<PlayaGrande />} />
            <Route path="samara" element={<Samara />} />
            <Route path="explore" element={<Explore />} />
            <Route path="auth" element={<Auth />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="user-dashboard" element={
              <BuyerProtectedRoute>
                <UserDashboard />
              </BuyerProtectedRoute>
            } />
            <Route path="realtor-dashboard" element={
              <RealtorProtectedRoute>
                <RealtorDashboard />
              </RealtorProtectedRoute>
            } />
            <Route path="admin-dashboard" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="resources" element={<Resources />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="costa-rica-laws" element={<CostaRicaLaws />} />
            <Route path="title-types" element={<TitleTypes />} />
            <Route path="due-diligence" element={<DueDiligence />} />
            <Route path="blog" element={<Blog />} />
            <Route path="owner-featured/:id" element={<OwnerFeaturedPropertyDetail />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App