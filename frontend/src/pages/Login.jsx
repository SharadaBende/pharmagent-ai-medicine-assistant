import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password })
      if (response.data.error) {
        showToast(t('loginInvalidError'), 'error')
      } else {
        login(response.data.access_token, email, response.data.profile_complete)
        navigate(response.data.profile_complete ? '/' : '/profile-setup')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        showToast(t('loginInvalidError'), 'error')
      } else {
        showToast(t('errorGeneric'), 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center
                    -mx-6 px-6 py-10
                    bg-gradient-to-br from-teal-50 via-white to-amber-50
                    dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white
                          flex items-center justify-center text-lg">
            💊
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
            {t('appName')}
          </span>
        </div>

        <h1 className="text-xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">
          {t('loginTitle')}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder={t('loginEmailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-900
                       text-slate-900 dark:text-slate-100
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       rounded-lg p-2.5
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
          <input
            type="password"
            placeholder={t('loginPasswordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-900
                       text-slate-900 dark:text-slate-100
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       rounded-lg p-2.5
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg p-2.5 font-semibold
                       disabled:opacity-50 transition mt-1"
          >
            {loading ? t('loginLoggingIn') : t('loginButton')}
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-slate-700 dark:text-slate-300">
          {t('loginNoAccount')}{' '}
          <Link to="/signup" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
            {t('loginSignupLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login