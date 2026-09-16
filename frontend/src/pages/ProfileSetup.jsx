import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

function ProfileSetup() {
  const { token, markProfileComplete } = useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [allergies, setAllergies] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [chronicConditions, setChronicConditions] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post(
        'http://127.0.0.1:8000/profile',
        {
          full_name: fullName,
          age: parseInt(age, 10),
          gender,
          allergies,
          current_medications: currentMedications,
          chronic_conditions: chronicConditions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      markProfileComplete()
      navigate('/')
    } catch (err) {
      setError(t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        {t('profileSetupTitle')}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        {t('profileSetupSubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
        <input
          type="text"
          placeholder={t('profileFullName')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          required
        />

        <div className="flex gap-3">
          <input
            type="number"
            placeholder={t('profileAge')}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="0"
            max="120"
            className="border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-800
                       text-slate-900 dark:text-slate-100
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       rounded p-2 w-1/3
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-800
                       text-slate-900 dark:text-slate-100
                       rounded p-2 flex-1
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          >
            <option value="" disabled>{t('profileGender')}</option>
            <option value="female">{t('profileGenderFemale')}</option>
            <option value="male">{t('profileGenderMale')}</option>
            <option value="other">{t('profileGenderOther')}</option>
            <option value="prefer_not_to_say">{t('profileGenderPreferNot')}</option>
          </select>
        </div>

        <textarea
          placeholder={t('profileAllergies')}
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          rows={2}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />

        <textarea
          placeholder={t('profileCurrentMedications')}
          value={currentMedications}
          onChange={(e) => setCurrentMedications(e.target.value)}
          rows={2}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />

        <textarea
          placeholder={t('profileChronicConditions')}
          value={chronicConditions}
          onChange={(e) => setChronicConditions(e.target.value)}
          rows={2}
          className="border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     rounded p-2
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded p-2 font-semibold
                     disabled:opacity-50 transition"
        >
          {loading ? t('profileSaving') : t('profileSaveButton')}
        </button>
      </form>

      {error && <p className="text-red-600 dark:text-red-400 mt-4">{error}</p>}
    </div>
  )
}

export default ProfileSetup