import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Chat from './pages/Chat'
import Interactions from './pages/Interactions'
import Symptoms from './pages/Symptoms'
import Ocr from './pages/Ocr'
import Home from './pages/Home'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuth } from './context/AuthContext'
import History from './pages/History'

function Navbar() {
  const { isLoggedIn, email, logout } = useAuth()

  return (
    <nav className="bg-blue-600 text-white p-4 flex gap-6 items-center">
      <span className="font-bold text-lg">PharmAgent</span>
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/chat" className="hover:underline">Chat</Link>
      <Link to="/interactions" className="hover:underline">Interactions</Link>
      <Link to="/symptoms" className="hover:underline">Symptoms</Link>
      <Link to="/ocr" className="hover:underline">Prescription OCR</Link>
      <Link to="/history" className="hover:underline">History</Link>
      <span className="ml-auto flex gap-4 items-center">
        {isLoggedIn ? (
          <>
            <span className="text-sm">{email}</span>
            <button onClick={logout} className="hover:underline text-sm">Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Log In</Link>
            <Link to="/signup" className="hover:underline">Sign Up</Link>
          </>
        )}
      </span>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 min-h-[80vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/interactions" element={<Interactions />} />
          <Route path="/symptoms" element={<Symptoms />} />
          <Route path="/ocr" element={<Ocr />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
      <footer className="text-center text-xs text-gray-500 py-6 border-t">
        PharmAgent provides general information only and is not a substitute for professional medical advice.
      </footer>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App