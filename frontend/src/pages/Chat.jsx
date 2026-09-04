import { useState } from 'react'
import axios from 'axios'

function Chat() {
  const [medicineName, setMedicineName] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setAnswer('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat', {
        medicine_name: medicineName,
        question: question,
      })
      setAnswer(response.data.answer)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ask About a Medicine</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Medicine name (e.g. ibuprofen)"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          className="border rounded p-2"
          required
        />
        <textarea
          placeholder="Your question (e.g. What is this used for?)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border rounded p-2"
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded p-2 font-semibold disabled:opacity-50"
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {answer && (
        <div className="mt-6 bg-gray-100 rounded p-4 whitespace-pre-wrap">
          {answer}
        </div>
      )}

      
    </div>
  )
}

export default Chat