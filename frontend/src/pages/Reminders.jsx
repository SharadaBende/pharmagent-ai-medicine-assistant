import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Reminders() {
  const { token, isLoggedIn } = useAuth()
  const [reminders, setReminders] = useState([])
  const [medicineName, setMedicineName] = useState('')
  const [dosageNote, setDosageNote] = useState('')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [error, setError] = useState('')
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const notifiedToday = useRef(new Set())

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const loadReminders = () => {
    if (!isLoggedIn) return
    axios
      .get('http://127.0.0.1:8000/reminders', authHeaders)
      .then((res) => setReminders(res.data))
      .catch(() => setError('Could not load reminders.'))
  }

  useEffect(() => {
    loadReminders()
  }, [isLoggedIn])

  // Check every 30 seconds whether any reminder's time has arrived
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5) // "HH:MM"
      const todayKey = now.toDateString()

      reminders.forEach((r) => {
        const notifKey = `${r.id}-${todayKey}`
        if (r.time_of_day === currentTime && !notifiedToday.current.has(notifKey)) {
          notifiedToday.current.add(notifKey)
          if (Notification.permission === 'granted') {
            new Notification(`Time to take ${r.medicine_name}`, {
              body: r.dosage_note || 'Reminder from PharmAgent',
            })
          }
        }
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [reminders])

  const requestPermission = () => {
    Notification.requestPermission().then(setNotifPermission)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await axios.post(
        'http://127.0.0.1:8000/reminders',
        { medicine_name: medicineName, dosage_note: dosageNote, time_of_day: timeOfDay, frequency },
        authHeaders
      )
      setMedicineName('')
      setDosageNote('')
      setTimeOfDay('')
      loadReminders()
    } catch (err) {
      setError('Could not create reminder.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/reminders/${id}`, authHeaders)
      loadReminders()
    } catch (err) {
      setError('Could not delete reminder.')
    }
  }

  if (!isLoggedIn) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Reminders
        </h1>
        <p className="text-slate-700 dark:text-slate-300">
          Please{' '}
          <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
            log in
          </Link>{' '}
          to set medicine reminders.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Medicine Reminders
      </h1>

      {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
        <div className="bg-amber-50 dark:bg-amber-950/40
                         border border-amber-300 dark:border-amber-700
                         text-amber-900 dark:text-amber-200
                         rounded p-3 mb-4 text-sm">
          Enable browser notifications to get reminded when it's time to take your medicine.
          <button
            onClick={requestPermission}
            className="ml-2 text-amber-700 dark:text-amber-300 hover:underline font-semibold"
          >
            Enable Notifications
          </button>
        </div>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Note: notifications only work while this tab is open in your browser.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mb-8">
        <input
          type="text"
          placeholder="Medicine name"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          required
        />
        <input
          type="text"
          placeholder="Dosage note (e.g. 1 tablet after food)"
          value={dosageNote}
          onChange={(e) => setDosageNote(e.target.value)}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          type="time"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          required
        />
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="daily">Daily</option>
          <option value="twice_daily">Twice Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-white rounded p-2 font-semibold transition"
        >
          Add Reminder
        </button>
      </form>

      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}

      <div className="flex flex-col gap-3">
        {reminders.length === 0 && (
          <p className="text-slate-600 dark:text-slate-400">No reminders set yet.</p>
        )}
        {reminders.map((r) => (
          <div
            key={r.id}
            className="border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800
                       rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {r.medicine_name}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {r.dosage_note} — {r.time_of_day} ({r.frequency.replace('_', ' ')})
              </div>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-red-600 dark:text-red-400 text-sm hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Reminders