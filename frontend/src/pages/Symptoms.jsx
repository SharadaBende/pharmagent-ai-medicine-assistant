import { useState } from 'react'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

function Symptoms() {
  const [symptom, setSymptom] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await axios.post('http://127.0.0.1:8000/symptoms', {
        symptom: symptom,
      })
      setResult(response.data)
    } catch (err) {
      setError(t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        {t('symptomsTitle')}
      </h1>

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

      {error && <p className="text-red-600 dark:text-red-400 mt-4">{error}</p>}

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