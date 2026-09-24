import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import MultiSelectDropdown from '../components/MultiSelectDropdown'
import { API_URL } from '../api'

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

function splitSavedList(savedString, knownOptions) {
  if (!savedString) return { known: [], other: '' }
  const items = savedString.split(',').map((s) => s.trim()).filter(Boolean)
  const known = items.filter((i) => knownOptions.includes(i))
  const other = items.filter((i) => !knownOptions.includes(i)).join(', ')
  return { known, other }
}

function getInitials(fullName) {
  if (!fullName) return '?'
  const parts = fullName.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

const GENDER_LABELS = {
  female: 'profileGenderFemale',
  male: 'profileGenderMale',
  other: 'profileGenderOther',
  prefer_not_to_say: 'profileGenderPreferNot',
}

function Profile() {
  const { token } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()

  const [editing, setEditing] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [selectedAllergies, setSelectedAllergies] = useState([])
  const [otherAllergy, setOtherAllergy] = useState('')
  const [selectedConditions, setSelectedConditions] = useState([])
  const [otherCondition, setOtherCondition] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')

  const loadProfile = () => {
    axios
      .get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.exists) {
          setFullName(res.data.full_name || '')
          setAge(res.data.age?.toString() || '')
          setGender(res.data.gender || '')
          setCurrentMedications(res.data.current_medications || '')

          const allergySplit = splitSavedList(res.data.allergies, ALLERGY_OPTIONS)
          setSelectedAllergies(allergySplit.known)
          setOtherAllergy(allergySplit.other)

          const conditionSplit = splitSavedList(res.data.chronic_conditions, CONDITION_OPTIONS)
          setSelectedConditions(conditionSplit.known)
          setOtherCondition(conditionSplit.other)
        }
      })
      .catch(() => showToast(t('errorGeneric'), 'error'))
      .finally(() => setFetching(false))
  }

  useEffect(() => {
    loadProfile()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const allergiesList = [...selectedAllergies, ...(otherAllergy.trim() ? [otherAllergy.trim()] : [])]
    const conditionsList = [...selectedConditions, ...(otherCondition.trim() ? [otherCondition.trim()] : [])]

    try {
      await axios.post(
        `${API_URL}/profile`,
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
      showToast(t('profileUpdateSuccess'))
      setEditing(false)
    } catch (err) {
      showToast(t('errorGeneric'), 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <p className="text-slate-600 dark:text-slate-400">{t('profileLoading')}</p>
  }

  const allergyPills = [...selectedAllergies, ...(otherAllergy.trim() ? [otherAllergy.trim()] : [])]
  const conditionPills = [...selectedConditions, ...(otherCondition.trim() ? [otherCondition.trim()] : [])]

  // ---------- VIEW MODE ----------
  if (!editing) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-500 text-white font-semibold
                           flex items-center justify-center text-xl shrink-0">
            {getInitials(fullName)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {fullName || '—'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {age && `${age} · `}
              {gender ? t(GENDER_LABELS[gender]) : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 max-w-md">
          <div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('profileAllergiesLabel')}
            </div>
            {allergyPills.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">{t('profileNoneListed')}</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {allergyPills.map((item) => (
                  <span
                    key={item}
                    className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300
                               text-xs px-2 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('profileConditionsLabel')}
            </div>
            {conditionPills.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">{t('profileNoneListed')}</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {conditionPills.map((item) => (
                  <span
                    key={item}
                    className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300
                               text-xs px-2 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('profileCurrentMedicationsLabel')}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {currentMedications || t('profileNoneListed')}
            </p>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded p-2 font-semibold
                       transition self-start px-6"
          >
            {t('profileEditButton')}
          </button>
        </div>
      </div>
    )
  }

  // ---------- EDIT MODE ----------
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
        {t('profileEditTitle')}
      </h1>

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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded p-2 font-semibold
                       disabled:opacity-50 transition flex-1"
          >
            {loading ? t('profileSaving') : t('profileUpdateButton')}
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); loadProfile() }}
            className="border border-slate-300 dark:border-slate-600
                       text-slate-700 dark:text-slate-300
                       rounded p-2 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700
                       transition px-6"
          >
            {t('profileCancelButton')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile