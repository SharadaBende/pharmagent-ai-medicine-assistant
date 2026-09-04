import { useState } from 'react'
import axios from 'axios'

function Symptoms() {
  const [symptom, setSymptom] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Symptom Checker</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          placeholder="Describe your symptom (e.g. mild headache, sore throat)"
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          className="border rounded p-2"
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded p-2 font-semibold disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Get Guidance'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {result && (
        <div
          className={`mt-6 rounded p-4 whitespace-pre-wrap border-2 ${
            result.emergency
              ? 'bg-red-50 border-red-500 text-red-800 font-semibold'
              : 'bg-gray-100 border-gray-200'
          }`}
        >
          {result.emergency && <div className="text-lg mb-2">⚠️ Emergency Notice</div>}
          {result.answer}
        </div>
      )}

     
    </div>
  )
}

export default Symptoms