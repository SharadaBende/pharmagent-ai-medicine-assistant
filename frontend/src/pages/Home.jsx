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
      {/* Hero band: full width background, centered content */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-amber-50
                          dark:from-slate-800 dark:via-slate-900 dark:to-slate-900
                          border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-20
                        grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight
                           text-slate-900 dark:text-slate-100">
              {t('homeHeroTitle')}
            </h1>
            <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
              {t('homeHeroSubtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/chat"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold
                           rounded-lg px-6 py-3 shadow transition"
              >
                {t('homeCtaChat')}
              </Link>
              <Link
                to="/symptoms"
                className="border border-teal-600 text-teal-700 dark:text-teal-400
                           hover:bg-teal-50 dark:hover:bg-slate-800
                           font-semibold rounded-lg px-6 py-3 transition"
              >
                {t('homeCtaSymptoms')}
              </Link>
            </div>
          </div>
          <img
            src={heroImage}
            alt=""
            className="w-full h-64 md:h-96 object-cover rounded-3xl shadow-xl
                       ring-4 ring-white dark:ring-slate-700"
          />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
          {t('homeFeaturesHeading')}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-800
                         rounded-xl p-6
                         hover:shadow-lg hover:-translate-y-0.5
                         hover:border-teal-400 dark:hover:border-teal-500
                         transition"
            >
              <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-950/40
                              flex items-center justify-center text-2xl mb-4">
                {f.icon}
              </div>
              <div className="font-semibold text-lg text-slate-900 dark:text-slate-100
                              group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
                {t(f.titleKey)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {t(f.descKey)}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-amber-50 dark:bg-amber-950/40
                        border border-amber-300 dark:border-amber-700
                        text-amber-900 dark:text-amber-200
                        rounded-lg p-4 text-sm">
          {t('homeDisclaimer')}
        </div>
      </section>
            {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-6 py-8
                          grid gap-4 sm:grid-cols-3 text-sm">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <span className="text-xl">✅</span> {t('homeTrustVerified')}
        </div>
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <span className="text-xl">🌐</span> {t('homeTrustLanguages')}
        </div>
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <span className="text-xl">🚨</span> {t('homeTrustEmergency')}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
          {t('homeHowHeading')}
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: '1', titleKey: 'homeHowStep1Title', descKey: 'homeHowStep1Desc' },
            { n: '2', titleKey: 'homeHowStep2Title', descKey: 'homeHowStep2Desc' },
            { n: '3', titleKey: 'homeHowStep3Title', descKey: 'homeHowStep3Desc' },
          ].map((step) => (
            <div key={step.n}>
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-semibold
                              flex items-center justify-center mb-3">
                {step.n}
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {t(step.titleKey)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t(step.descKey)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home