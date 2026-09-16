import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const { isLoggedIn, email, fullName, logout } = useAuth()
  const { language, changeLanguage, t } = useLanguage()
  const { isDark, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getInitials = () => {
    if (fullName) {
      const parts = fullName.trim().split(/\s+/)
      return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase()
    }
    return email ? email[0].toUpperCase() : '?'
  }

  const handleLogout = () => {
    setMenuOpen(false)
    setMobileNavOpen(false)
    logout()
    navigate('/signup')
  }

  const linkClass = ({ isActive }) =>
    `hover:underline ${isActive ? 'underline font-semibold text-white' : 'text-teal-50'}`

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 border-b border-teal-500 dark:border-teal-700 ${
      isActive ? 'font-semibold text-white bg-teal-700 dark:bg-teal-900' : 'text-teal-50'
    }`

  const navLinks = [
    { to: '/', label: t('navHome') },
    { to: '/chat', label: t('navChat') },
    { to: '/interactions', label: t('navInteractions') },
    { to: '/symptoms', label: t('navSymptoms') },
    { to: '/ocr', label: t('navOcr') },
    { to: '/history', label: t('navHistory') },
    { to: '/reminders', label: t('navReminders') },
  ]

  return (
    <nav className="bg-teal-600 dark:bg-teal-800 text-white">
      <div className="p-4 flex items-center gap-4">
        {isLoggedIn && (
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            className="md:hidden text-2xl leading-none"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? '✕' : '☰'}
          </button>
        )}

        <span className="font-bold text-lg">{t('appName')}</span>

        {isLoggedIn && (
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="text-black rounded px-2 py-1 text-sm ml-auto md:ml-0"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="mr">मराठी</option>
        </select>

        <button onClick={toggleTheme} className="text-xl" title="Toggle dark mode">
          {isDark ? '☀️' : '🌙'}
        </button>

        {isLoggedIn && (
          <div ref={menuRef} className="relative md:ml-auto">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-9 h-9 rounded-full bg-amber-500 text-white font-semibold
                         flex items-center justify-center text-sm
                         hover:bg-amber-600 transition"
              title={fullName || email}
            >
              {getInitials()}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800
                               border border-slate-200 dark:border-slate-700
                               rounded-lg shadow-lg overflow-hidden text-sm z-20">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700
                                 text-slate-900 dark:text-slate-100 font-medium truncate">
                  {fullName || email}
                </div>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/profile') }}
                  className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300
                             hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  {t('navProfile')}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400
                             hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  {t('navLogout')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoggedIn && mobileNavOpen && (
        <div className="md:hidden border-t border-teal-500 dark:border-teal-700">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={mobileLinkClass}
              onClick={() => setMobileNavOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar