"use client"

/**
 * Firebase Authentication Context Provider
 * Provides authentication state and methods to entire app
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User } from "firebase/auth"
import { 
  getFirebaseClientAuth, 
  signIn as firebaseSignIn, 
  signOutUser,
  onAuthChange,
  getCurrentUserToken 
} from "@/lib/firebase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  token: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize Firebase Auth
    const auth = getFirebaseClientAuth()
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Get fresh token
        const idToken = await firebaseUser.getIdToken()
        setToken(idToken)
      } else {
        setToken(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { user: signedInUser, token: idToken } = await firebaseSignIn(email, password)
      setUser(signedInUser)
      setToken(idToken)
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      setUser(null)
      setToken(null)
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const refreshToken = async () => {
    const newToken = await getCurrentUserToken()
    setToken(newToken)
    return newToken
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
