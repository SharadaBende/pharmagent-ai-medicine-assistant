import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import heroImage from '../assets/hero.jpg'

const features = [
  { to: '/chat', icon: '💬', titleKey: 'homeFeatureChatTitle', descKey: 'homeFeatureChatDesc' },
  { to: '/interactions', icon: '⚕️', titleKey: 'homeFeatureInteractionsTitle', descKey: 'homeFeatureInteractionsDesc' },
  { to: '/symptoms', icon: '🩺', titleKey: 'homeFeatureSymptomsTitle', descKey: 'homeFeatureSymptomsDesc' },
  { to: '/ocr', icon: '📄', titleKey: 'homeFeatureOcrTitle', descKey: 'homeFeatureOcrDesc' },
  { to: '/reminders', icon: '⏰', titleKey: 'homeFeatureRemindersTitle', descKey: 'homeFeatureRemindersDesc' },
]

function Home() {
  const { t } = useLanguage()

  return (
    <div>
      {/* Hero */}
      <section className="grid gap-8 md:grid-cols-2 items-center mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900 dark:text-slate-100">
            {t('homeHeroTitle')}
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            {t('homeHeroSubtitle')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/chat"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold
                         rounded-lg px-5 py-2.5 transition"
            >
              {t('homeCtaChat')}
            </Link>
            <Link
              to="/symptoms"
              className="border border-teal-600 text-teal-700 dark:text-teal-400
                         hover:bg-teal-50 dark:hover:bg-slate-800
                         font-semibold rounded-lg px-5 py-2.5 transition"
            >
              {t('homeCtaSymptoms')}
            </Link>
          </div>
        </div>
        <img
          src={heroImage}
          alt=""
          className="w-full h-56 md:h-72 object-cover rounded-2xl shadow-lg"
        />
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          {t('homeFeaturesHeading')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-800
                         rounded-xl p-5
                         hover:shadow-md hover:border-teal-400 dark:hover:border-teal-500
                         transition"
            >
              <div className="w-11 h-11 rounded-lg bg-teal-50 dark:bg-teal-950/40
                              flex items-center justify-center text-2xl mb-3">
                {f.icon}
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100
                              group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
                {t(f.titleKey)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t(f.descKey)}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-amber-50 dark:bg-amber-950/40
                          border border-amber-300 dark:border-amber-700
                          text-amber-900 dark:text-amber-200
                          rounded-lg p-4 text-sm">
        {t('homeDisclaimer')}
      </section>
    </div>
  )
}

export default Home