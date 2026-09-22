import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Chat from './pages/Chat'
import Interactions from './pages/Interactions'
import Symptoms from './pages/Symptoms'
import Ocr from './pages/Ocr'
import Home from './pages/Home'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfileSetup from './pages/ProfileSetup'
import Profile from './pages/Profile'
import { useAuth } from './context/AuthContext'
import History from './pages/History'
import Reminders from './pages/Reminders'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import NotFound from './pages/NotFound'
import { ToastProvider } from './context/ToastContext'

// Gates any route behind login + a completed profile.
// Not logged in -> /signup. Logged in but no profile -> /profile-setup.
function RequireAuth({ children }) {
  const { isLoggedIn, profileComplete } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/signup" replace />
  }
  if (!profileComplete) {
    return <Navigate to="/profile-setup" replace />
  }
  return children
}

// For /login and /signup: if already fully set up, skip straight to Home
// instead of showing the auth forms again.
function RedirectIfAuthed({ children }) {
  const { isLoggedIn, profileComplete } = useAuth()

  if (isLoggedIn && profileComplete) {
    return <Navigate to="/" replace />
  }
  return children
}

// For /profile-setup: only needs login, not a completed profile
// (that's the whole point of this page) — but still needs to kick
// out a logged-out user, e.g. after they log out while sitting here.
function RequireLogin({ children }) {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/signup" replace />
  }
  return children
}

function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
       <ToastProvider>
    <AuthProvider>
    <BrowserRouter>
  <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
    <Navbar />
    <div className="max-w-2xl mx-auto p-6 min-h-[70vh]">
      <Routes>
        <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
        <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
        <Route path="/profile-setup" element={<RequireLogin><ProfileSetup /></RequireLogin>} />

        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="/interactions" element={<RequireAuth><Interactions /></RequireAuth>} />
        <Route path="/symptoms" element={<RequireAuth><Symptoms /></RequireAuth>} />
        <Route path="/ocr" element={<RequireAuth><Ocr /></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
        <Route path="/reminders" element={<RequireAuth><Reminders /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
    <Footer />
  </div>
</BrowserRouter>
    </AuthProvider>
     </ToastProvider>
    </LanguageProvider>
    </ThemeProvider>

  )
}

export default App