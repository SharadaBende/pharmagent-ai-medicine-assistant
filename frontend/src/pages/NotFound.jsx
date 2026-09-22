import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-6xl font-bold text-teal-600 dark:text-teal-400 mb-4">404</h1>
      <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
        {t('notFoundMessage')}
      </p>
      <Link
        to="/"
        className="bg-teal-600 hover:bg-teal-700 text-white rounded px-6 py-2 font-semibold transition"
      >
        {t('notFoundBackHome')}
      </Link>
    </div>
  )
}

export default NotFound