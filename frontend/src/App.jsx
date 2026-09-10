import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
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

function Navbar() {
  const { isLoggedIn, email, logout } = useAuth()
  const { language, changeLanguage, t } = useLanguage()

  return (
    <nav className="bg-blue-600 text-white p-4 flex gap-6 items-center flex-wrap">
      <span className="font-bold text-lg">{t('appName')}</span>
      <Link to="/" className="hover:underline">{t('navHome')}</Link>
      <Link to="/chat" className="hover:underline">{t('navChat')}</Link>
      <Link to="/interactions" className="hover:underline">{t('navInteractions')}</Link>
      <Link to="/symptoms" className="hover:underline">{t('navSymptoms')}</Link>
      <Link to="/ocr" className="hover:underline">{t('navOcr')}</Link>
      <Link to="/history" className="hover:underline">{t('navHistory')}</Link>
      <Link to="/reminders" className="hover:underline">{t('navReminders')}</Link>

      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="text-black rounded px-2 py-1 text-sm"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="mr">मराठी</option>
      </select>

      <span className="ml-auto flex gap-4 items-center">
        {isLoggedIn ? (
          <>
            <span className="text-sm">{email}</span>
            <button onClick={logout} className="hover:underline text-sm">{t('navLogout')}</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">{t('navLogin')}</Link>
            <Link to="/signup" className="hover:underline">{t('navSignup')}</Link>
          </>
        )}
      </span>
    </nav>
  )
}

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="text-center text-xs text-gray-500 py-6 border-t">
      {t('footerDisclaimer')}
    </footer>
  )
}


function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 min-h-[80vh]">
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
    </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>

  )
}

export default App