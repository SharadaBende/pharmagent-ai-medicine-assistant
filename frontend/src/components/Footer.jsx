import { useLanguage } from '../context/LanguageContext'

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-6 border-t border-slate-200 dark:border-slate-700">
      {t('footerDisclaimer')}
    </footer>
  )
}

export default Footer