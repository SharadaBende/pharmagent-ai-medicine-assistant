import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../api'

function Signup() {
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
      const response = await axios.post(`${API_URL}/signup`, { email, password })
      if (response.data.error) {
        showToast(t('signupEmailExistsError'), 'error')
      } else {
        login(response.data.access_token, email, response.data.profile_complete)
        navigate('/profile-setup')
      }
    } catch (err) {
      if (err.response?.status === 409) {
        showToast(t('signupEmailExistsError'), 'error')
      } else {
        showToast(t('errorGeneric'), 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        {t('signupTitle')}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <input
          type="email"
          placeholder={t('loginEmailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          required
        />
        <input
          type="password"
          placeholder={t('signupPasswordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          minLength={8}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded p-2 font-semibold
                     disabled:opacity-50 transition"
        >
          {loading ? t('signupCreating') : t('signupButton')}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
        {t('signupHaveAccount')}{' '}
        <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
          {t('signupLoginLink')}
        </Link>
      </p>
    </div>
  )
}

export default Signup