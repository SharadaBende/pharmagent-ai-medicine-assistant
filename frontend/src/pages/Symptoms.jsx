import { useState } from 'react'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../api'

function Symptoms() {
  const [symptom, setSymptom] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()
  const { language, t } = useLanguage()
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.post(
        `${API_URL}/symptoms`,
        {
          symptom: symptom,
          language: language,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      setResult(response.data)
    } catch (err) {
      showToast(t('errorGeneric'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
  <div className="w-11 h-11 rounded-lg bg-teal-50 dark:bg-teal-950/40
                  flex items-center justify-center text-2xl shrink-0">
    🩺
  </div>
  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
    {t('symptomsTitle')}
  </h1>
</div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          placeholder={t('symptomsPlaceholder')}
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded p-2 font-semibold
                     disabled:opacity-50 transition"
        >
          {loading ? t('symptomsChecking') : t('symptomsButton')}
        </button>
      </form>

      {loading && (
  <div
    className="mt-6 bg-slate-100 dark:bg-slate-800
               border-2 border-slate-200 dark:border-slate-700
               rounded p-4 animate-pulse"
    role="status"
    aria-label={t('symptomsChecking')}
  >
    <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
    <div className="h-3 w-11/12 rounded bg-slate-200 dark:bg-slate-700 mt-3" />
    <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700 mt-3" />
    <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700 mt-3" />
  </div>
)}

      {result && (
        <div
          className={`mt-6 rounded p-4 whitespace-pre-wrap border-2 ${
            result.emergency
              ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300 font-semibold'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
          }`}
        >
          {result.emergency && <div className="text-lg mb-2">{t('symptomsEmergencyNotice')}</div>}
          {result.answer}
        </div>
      )}
    </div>
  )
}

export default Symptoms