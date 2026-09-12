import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/signup', { email, password })
      if (response.data.error) {
        setError(response.data.error)
      } else {
        login(response.data.access_token, email)
        navigate('/')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Sign Up
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <input
          type="email"
          placeholder="Email"
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
          placeholder="Password (min 8 characters)"
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
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      {error && <p className="text-red-600 dark:text-red-400 mt-4">{error}</p>}
      <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

export default Signup