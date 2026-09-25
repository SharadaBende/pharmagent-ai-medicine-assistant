import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../api'

function History() {
  const { token, isLoggedIn } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()
  const { showToast } = useToast()

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }

    axios
      .get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setHistory(response.data))
      .catch(() => showToast(t('historyLoadError'), 'error'))
      .finally(() => setLoading(false))
  }, [token, isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
  <div className="w-11 h-11 rounded-lg bg-teal-50 dark:bg-teal-950/40
                  flex items-center justify-center text-2xl shrink-0">
    📋
  </div>
  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
    {t('historyTitle')}
  </h1>
</div>
        <p className="text-slate-700 dark:text-slate-300">
          {t('historyLoginPrompt')}{' '}
          <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
            {t('historyLoginLinkText')}
          </Link>{' '}
          {t('historyLoginSuffix')}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
  <div className="w-11 h-11 rounded-lg bg-teal-50 dark:bg-teal-950/40
                  flex items-center justify-center text-2xl shrink-0">
    📋
  </div>
  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
    {t('historyTitle')}
  </h1>
</div>

      {loading && (
  <div className="flex flex-col gap-4" role="status" aria-label={t('historyLoading')}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="border border-slate-200 dark:border-slate-700
                   bg-white dark:bg-slate-800
                   rounded-lg p-4 animate-pulse"
      >
        <div className="flex justify-between items-start">
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700 mt-3" />
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700 mt-3" />
        <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700 mt-2" />
      </div>
    ))}
  </div>
)}

      {!loading && history.length === 0 && (
        <p className="text-slate-600 dark:text-slate-400">{t('historyEmpty')}</p>
      )}

      <div className="flex flex-col gap-4">
        {history.map((entry, i) => (
          <div
            key={i}
            className="border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800
                       rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {entry.medicine_name}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                {new Date(entry.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t('historyQuestionLabel')} {entry.question}
            </div>
            <div className="text-sm mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {entry.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default History