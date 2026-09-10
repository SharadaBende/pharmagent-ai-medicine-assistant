import { useState, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

function Chat() {
  const [medicineName, setMedicineName] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { token } = useAuth()
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const { language, t } = useLanguage()

const startListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    alert('Voice input is not supported in this browser. Try Chrome.')
    return
  }

  const recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onstart = () => setIsListening(true)
  recognition.onend = () => setIsListening(false)
  recognition.onerror = () => setIsListening(false)

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    setQuestion((prev) => (prev ? prev + ' ' + transcript : transcript))
  }

  recognitionRef.current = recognition
  recognition.start()
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setAnswer('')

    try {
      const response = await axios.post(
  'http://127.0.0.1:8000/chat',
  {
    medicine_name: medicineName,
    question: question,
    language: language,
  },
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }
)
      setAnswer(response.data.answer)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('chatTitle')}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder={t('chatMedicinePlaceholder')}
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          className="border rounded p-2"
          required
        />
        <div className="relative">
  <textarea
    placeholder={t('chatQuestionPlaceholder')}
    value={question}
    onChange={(e) => setQuestion(e.target.value)}
    className="border rounded p-2 w-full pr-12"
    rows={3}
    required
  />
  <button
    type="button"
    onClick={startListening}
    className={`absolute right-2 top-2 text-xl ${isListening ? 'text-red-600 animate-pulse' : 'text-gray-500'}`}
    title="Speak your question"
  >
    🎤
  </button>
</div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded p-2 font-semibold disabled:opacity-50"
        >
          {loading ? t('chatAsking') : t('chatAskButton')}
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