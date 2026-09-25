import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-50 dark:bg-slate-950
                       border-t border-slate-200 dark:border-slate-800
                       mt-8">
      <div className="max-w-6xl mx-auto px-6 py-10
                      grid gap-8 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white
                            flex items-center justify-center text-sm">
              💊
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {t('appName')}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
            {t('footerTagline')}
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {t('footerLinksHeading')}
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <Link to="/chat" className="text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400">
              {t('navChat')}
            </Link>
            <Link to="/symptoms" className="text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400">
              {t('navSymptoms')}
            </Link>
            <Link to="/reminders" className="text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400">
              {t('navReminders')}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800
                      text-center text-xs text-slate-500 dark:text-slate-400 py-4">
        {t('footerDisclaimer')} · © {year} {t('appName')} · {t('footerRights')}
      </div>
    </footer>
  )
}

export default Footer