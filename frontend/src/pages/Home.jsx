import { Link } from 'react-router-dom'

const features = [
  { to: '/chat', title: 'Chat Q&A', desc: 'Ask questions about common medicines, grounded in verified drug data.' },
  { to: '/interactions', title: 'Interaction Checker', desc: 'Check for known interactions between two medicines.' },
  { to: '/symptoms', title: 'Symptom Checker', desc: 'Get general OTC-category guidance for mild symptoms.' },
  { to: '/ocr', title: 'Prescription Reader', desc: 'Upload a prescription image to extract and verify medicine details.' },
]

function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        PharmAgent
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
        An AI-powered medicine assistant that answers medicine questions, checks drug interactions,
        offers general symptom guidance, and reads prescriptions — all grounded in verified drug data,
        never guessed.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800
                       rounded-lg p-4
                       hover:shadow-md hover:border-teal-400 dark:hover:border-teal-500
                       transition"
          >
            <div className="font-semibold text-lg text-slate-900 dark:text-slate-100
                             group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
              {f.title}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {f.desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home