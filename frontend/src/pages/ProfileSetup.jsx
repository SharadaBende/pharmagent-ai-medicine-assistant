import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import MultiSelectDropdown from '../components/MultiSelectDropdown'

const ALLERGY_OPTIONS = [
  'Penicillin', 'Amoxicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen / NSAIDs',
  'Cephalosporins', 'Codeine / Opioids', 'Local anesthetics (e.g. lidocaine)',
  'Latex', 'Iodine / Contrast dye', 'Peanuts', 'Tree nuts', 'Shellfish', 'Eggs',
  'Milk / Dairy', 'Soy', 'Wheat / Gluten', 'Pollen', 'Dust mites', 'Pet dander',
  'Bee / Insect stings', 'Nickel', 'Adhesive tape / Bandages',
]

const CONDITION_OPTIONS = [
  'Diabetes (Type 1)', 'Diabetes (Type 2)', 'Hypertension', 'Asthma',
  'Kidney disease', 'Liver disease', 'Heart disease', 'Thyroid disorder',
  'Epilepsy / Seizure disorder', 'COPD', 'Anemia', 'Glaucoma',
  'Peptic ulcer disease', 'Osteoporosis', 'Pregnancy', 'Breastfeeding',
]

function ProfileSetup() {
  const { token, markProfileComplete } = useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [selectedAllergies, setSelectedAllergies] = useState([])
  const [otherAllergy, setOtherAllergy] = useState('')
  const [selectedConditions, setSelectedConditions] = useState([])
  const [otherCondition, setOtherCondition] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const allergiesList = [...selectedAllergies, ...(otherAllergy.trim() ? [otherAllergy.trim()] : [])]
    const conditionsList = [...selectedConditions, ...(otherCondition.trim() ? [otherCondition.trim()] : [])]

    try {
      await axios.post(
        'http://127.0.0.1:8000/profile',
        {
          full_name: fullName,
          age: parseInt(age, 10),
          gender,
          allergies: allergiesList.join(', '),
          current_medications: currentMedications,
          chronic_conditions: conditionsList.join(', '),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      markProfileComplete(fullName)
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
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

        <div>
          <MultiSelectDropdown
            label={t('profileAllergiesLabel')}
            options={ALLERGY_OPTIONS}
            selected={selectedAllergies}
            onChange={setSelectedAllergies}
            placeholder={t('profileAllergiesPlaceholder')}
          />
          <input
            type="text"
            placeholder={t('profileOtherAllergy')}
            value={otherAllergy}
            onChange={(e) => setOtherAllergy(e.target.value)}
            className="border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-800
                       text-slate-900 dark:text-slate-100
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       rounded p-2 mt-2 w-full text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <MultiSelectDropdown
            label={t('profileConditionsLabel')}
            options={CONDITION_OPTIONS}
            selected={selectedConditions}
            onChange={setSelectedConditions}
            placeholder={t('profileConditionsPlaceholder')}
          />
          <input
            type="text"
            placeholder={t('profileOtherCondition')}
            value={otherCondition}
            onChange={(e) => setOtherCondition(e.target.value)}
            className="border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-800
                       text-slate-900 dark:text-slate-100
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       rounded p-2 mt-2 w-full text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

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