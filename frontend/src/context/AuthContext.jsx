import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [email, setEmail] = useState(localStorage.getItem('email'))
  const [profileComplete, setProfileComplete] = useState(
    localStorage.getItem('profileComplete') === 'true'
  )

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

  const login = (newToken, userEmail, isProfileComplete = false) => {
    setToken(newToken)
    setEmail(userEmail)
    setProfileComplete(isProfileComplete)
  }

  const logout = () => {
    setToken(null)
    setEmail(null)
    setProfileComplete(false)
  }

  const markProfileComplete = () => {
    setProfileComplete(true)
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}