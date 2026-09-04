import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Chat from './pages/Chat'
import Interactions from './pages/Interactions'
import Symptoms from './pages/Symptoms'
import Ocr from './pages/Ocr'
import Home from './pages/Home'

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex gap-6">
      <span className="font-bold text-lg">PharmAgent</span>
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/chat" className="hover:underline">Chat</Link>
      <Link to="/interactions" className="hover:underline">Interactions</Link>
      <Link to="/symptoms" className="hover:underline">Symptoms</Link>
      <Link to="/ocr" className="hover:underline">Prescription OCR</Link>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 min-h-[80vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/interactions" element={<Interactions />} />
          <Route path="/symptoms" element={<Symptoms />} />
          <Route path="/ocr" element={<Ocr />} />
        </Routes>
      </div>
      <footer className="text-center text-xs text-gray-500 py-6 border-t">
        PharmAgent provides general information only and is not a substitute for professional medical advice.
      </footer>
    </BrowserRouter>
  )
}

export default App