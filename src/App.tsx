import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AuthPage from './pages/AuthPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import EventNewPage from './pages/EventNewPage'
import DogsPage from './pages/DogsPage'
import DogDetailPage from './pages/DogDetailPage'
import DogNewPage from './pages/DogNewPage'
import DogEditPage from './pages/DogEditPage'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/new" element={<EventNewPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/dogs" element={<DogsPage />} />
        <Route path="/dogs/new" element={<DogNewPage />} />
        <Route path="/dogs/:id" element={<DogDetailPage />} />
        <Route path="/dogs/:id/edit" element={<DogEditPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
