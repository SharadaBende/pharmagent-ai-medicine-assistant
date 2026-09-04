import { useState } from 'react'
import axios from 'axios'

function Interactions() {
  const [drugA, setDrugA] = useState('')
  const [drugB, setDrugB] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await axios.post('http://127.0.0.1:8000/interactions', {
        drug_a: drugA,
        drug_b: drugB,
      })
      setResult(response.data)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const severityColor = {
    mild: 'bg-yellow-100 text-yellow-800',
    moderate: 'bg-orange-100 text-orange-800',
    severe: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-800',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Drug Interaction Checker</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="First medicine (e.g. aspirin)"
          value={drugA}
          onChange={(e) => setDrugA(e.target.value)}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Second medicine (e.g. ibuprofen)"
          value={drugB}
          onChange={(e) => setDrugB(e.target.value)}
          className="border rounded p-2"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded p-2 font-semibold disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Interaction'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-6">
          <div className={`inline-block px-3 py-1 rounded text-sm font-semibold mb-2 ${severityColor[result.severity] || severityColor.unknown}`}>
            {result.verified ? `Severity: ${result.severity}` : 'Not verified in database'}
          </div>
          <div className="bg-gray-100 rounded p-4 whitespace-pre-wrap">
            {result.description}
          </div>
        </div>
      )}

      
    </div>
  )
}

export default Interactions