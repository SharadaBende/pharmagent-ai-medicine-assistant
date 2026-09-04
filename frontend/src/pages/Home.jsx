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
      <h1 className="text-3xl font-bold mb-2">PharmAgent</h1>
      <p className="text-gray-600 mb-8">
        An AI-powered medicine assistant that answers medicine questions, checks drug interactions,
        offers general symptom guidance, and reads prescriptions — all grounded in verified drug data,
        never guessed.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="border rounded-lg p-4 hover:shadow-md hover:border-blue-400 transition"
          >
            <div className="font-semibold text-lg">{f.title}</div>
            <div className="text-sm text-gray-600 mt-1">{f.desc}</div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-8">
        PharmAgent provides general information only and is not a substitute for professional medical advice.
      </p>
    </div>
  )
}

export default Home