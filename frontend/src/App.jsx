import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Chat from './pages/Chat'
import Interactions from './pages/Interactions'
import Symptoms from './pages/Symptoms'
import Ocr from './pages/Ocr'
import Home from './pages/Home'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuth } from './context/AuthContext'
import History from './pages/History'
import Reminders from './pages/Reminders'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'

function Navbar() {
  const { isLoggedIn, email, logout } = useAuth()
  const { language, changeLanguage, t } = useLanguage()
  const { isDark, toggleTheme } = useTheme()

  const linkClass = ({ isActive }) =>
    `hover:underline ${isActive ? 'underline font-semibold text-white' : 'text-teal-50'}`

  return (
    <nav className="bg-teal-600 dark:bg-teal-800 text-white p-4 flex gap-6 items-center flex-wrap">
      <span className="font-bold text-lg">{t('appName')}</span>
      <NavLink to="/" className={linkClass}>{t('navHome')}</NavLink>
      <NavLink to="/chat" className={linkClass}>{t('navChat')}</NavLink>
      <NavLink to="/interactions" className={linkClass}>{t('navInteractions')}</NavLink>
      <NavLink to="/symptoms" className={linkClass}>{t('navSymptoms')}</NavLink>
      <NavLink to="/ocr" className={linkClass}>{t('navOcr')}</NavLink>
      <NavLink to="/history" className={linkClass}>{t('navHistory')}</NavLink>
      <NavLink to="/reminders" className={linkClass}>{t('navReminders')}</NavLink>

      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="text-black rounded px-2 py-1 text-sm"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="mr">मराठी</option>
      </select>

      <button onClick={toggleTheme} className="text-xl" title="Toggle dark mode">
        {isDark ? '☀️' : '🌙'}
      </button>

      <span className="ml-auto flex gap-4 items-center">
        {isLoggedIn ? (
          <>
            <span className="text-sm text-teal-50">{email}</span>
            <button onClick={logout} className="hover:underline text-sm">{t('navLogout')}</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>{t('navLogin')}</NavLink>
            <NavLink to="/signup" className={linkClass}>{t('navSignup')}</NavLink>
          </>
        )}
      </span>
    </nav>
  )
}

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-6 border-t border-slate-200 dark:border-slate-700">
      {t('footerDisclaimer')}
    </footer>
  )
}


function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
    <AuthProvider>
    <BrowserRouter>
  <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
    <Navbar />
    <div className="max-w-2xl mx-auto p-6 min-h-[70vh]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/interactions" element={<Interactions />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/ocr" element={<Ocr />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/history" element={<History />} />
        <Route path="/reminders" element={<Reminders />} />
      </Routes>
    </div>
    <Footer />
  </div>
</BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>

  )
}

export default App