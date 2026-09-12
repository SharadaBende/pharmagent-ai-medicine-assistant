import { useState } from 'react'
import axios from 'axios'

function Ocr() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('http://127.0.0.1:8000/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Prescription Reader (OCR)
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     rounded p-2
                     file:mr-3 file:py-1 file:px-3 file:rounded
                     file:border-0 file:bg-teal-600 file:text-white
                     file:font-semibold hover:file:bg-teal-700 file:transition"
          required
        />
        <button
          type="submit"
          disabled={loading || !file}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded p-2 font-semibold
                     disabled:opacity-50 transition"
        >
          {loading ? 'Reading prescription...' : 'Upload & Read'}
        </button>
      </form>

      {error && <p className="text-red-600 dark:text-red-400 mt-4">{error}</p>}

      {result && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Matched Medicines
          </h2>
          {result.matched_medicines.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">
              No medicines from our database were confidently matched. Please double-check with your pharmacist.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {result.matched_medicines.map((med, i) => (
                <div
                  key={i}
                  className="bg-slate-100 dark:bg-slate-800
                             border border-slate-200 dark:border-slate-700
                             rounded p-4"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {med.generic_name} ({med.brand_name})
                  </div>
                  <div className="text-sm mt-1 text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Purpose:</span> {med.purpose}
                  </div>
                  <div className="text-sm mt-1 text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Dosage:</span> {med.verified_dosage}
                  </div>
                </div>
              ))}
            </div>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400">
              View raw extracted text
            </summary>
            <pre className="text-xs bg-slate-50 dark:bg-slate-800
                             text-slate-700 dark:text-slate-300
                             p-2 mt-2 whitespace-pre-wrap">
              {result.raw_extracted_text}
            </pre>
          </details>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">{result.note}</p>
        </div>
      )}
    </div>
  )
}

export default Ocr