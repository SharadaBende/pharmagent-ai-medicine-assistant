import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [email, setEmail] = useState(localStorage.getItem('email'))
  const [profileComplete, setProfileComplete] = useState(
    localStorage.getItem('profileComplete') === 'true'
  )
  const [fullName, setFullName] = useState(localStorage.getItem('fullName') || '')

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    if (email) {
      localStorage.setItem('email', email)
    } else {
      localStorage.removeItem('email')
    }
  }, [email])

  useEffect(() => {
    localStorage.setItem('profileComplete', profileComplete ? 'true' : 'false')
  }, [profileComplete])

  useEffect(() => {
    if (fullName) {
      localStorage.setItem('fullName', fullName)
    } else {
      localStorage.removeItem('fullName')
    }
  }, [fullName])

  // Whenever we know the profile is complete, fetch the name to display.
  useEffect(() => {
    if (token && profileComplete && !fullName) {
      axios
        .get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.exists) {
            setFullName(res.data.full_name)
          }
        })
        .catch(() => {})
    }
  }, [token, profileComplete])

  const login = (newToken, userEmail, isProfileComplete = false) => {
    setToken(newToken)
    setEmail(userEmail)
    setProfileComplete(isProfileComplete)
  }

  const logout = () => {
    setToken(null)
    setEmail(null)
    setProfileComplete(false)
    setFullName('')
  }

  const markProfileComplete = (name) => {
    setProfileComplete(true)
    if (name) setFullName(name)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        login,
        logout,
        isLoggedIn: !!token,
        profileComplete,
        markProfileComplete,
        fullName,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}