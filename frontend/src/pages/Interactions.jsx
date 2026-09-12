import { useState } from 'react'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

function Interactions() {
  const [drugs, setDrugs] = useState(['', ''])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { language, t } = useLanguage()

  const updateDrug = (index, value) => {
    const updated = [...drugs]
    updated[index] = value
    setDrugs(updated)
  }

  const addDrugField = () => {
    setDrugs([...drugs, ''])
  }

  const removeDrugField = (index) => {
    if (drugs.length <= 2) return
    setDrugs(drugs.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const filledDrugs = drugs.map((d) => d.trim()).filter(Boolean)

    if (filledDrugs.length < 2) {
      setError(t('interactionsMinError'))
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await axios.post('http://127.0.0.1:8000/interactions/multi', {
        drug_names: filledDrugs,
      })
      if (response.data.error) {
        setError(response.data.error)
      } else {
        setResults(response.data.results)
      }
    } catch (err) {
      setError(t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const severityColor = {
    mild: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    severe: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    unknown: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        {t('interactionsTitle')}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        {t('interactionsSubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {drugs.map((drug, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder={`${t('interactionsMedicineLabel')} ${i + 1}`}
              value={drug}
              onChange={(e) => updateDrug(i, e.target.value)}
              className="border border-slate-300 dark:border-slate-600
                         bg-white dark:bg-slate-800
                         text-slate-900 dark:text-slate-100
                         placeholder:text-slate-400 dark:placeholder:text-slate-500
                         rounded p-2 flex-1
                         focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {drugs.length > 2 && (
              <button
                type="button"
                onClick={() => removeDrugField(i)}
                className="text-red-600 dark:text-red-400 px-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addDrugField}
          className="text-teal-600 dark:text-teal-400 text-sm text-left hover:underline"
        >
          {t('interactionsAddAnother')}
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded p-2 font-semibold
                     disabled:opacity-50 transition"
        >
          {loading ? t('interactionsChecking') : t('interactionsCheckButton')}
        </button>
      </form>

      {error && <p className="text-red-600 dark:text-red-400 mt-4">{error}</p>}

      {results && (
        <div className="mt-6 flex flex-col gap-3">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            {t('interactionsResultsHeading')} ({results.length} {t('interactionsPairsChecked')})
          </h2>
          {results.map((r, i) => (
            <div
              key={i}
              className="border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-800
                         rounded-lg p-4"
            >
              <div className="font-medium mb-1 text-slate-900 dark:text-slate-100">
                {r.drug_a} + {r.drug_b}
              </div>
              <div className={`inline-block px-3 py-1 rounded text-sm font-semibold mb-2 ${severityColor[r.severity] || severityColor.unknown}`}>
                {r.verified ? `${t('interactionsSeverityLabel')}: ${r.severity}` : t('interactionsNotVerified')}
              </div>
              <div className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {r.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Interactions