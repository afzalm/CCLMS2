"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  email: string
  name?: string
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN"
  avatar?: string
  bio?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  hasRole: (role: string) => boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // In a real app, this would verify the session with your backend
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // In a real app, this would make an API call to your backend
      // Mock authentication logic
      const mockUsers = [
        {
          id: "1",
          email: "student@example.com",
          name: "John Student",
          role: "STUDENT" as const,
          avatar: "/api/placeholder/100/100"
        },
        {
          id: "2",
          email: "instructor@example.com",
          name: "Jane Instructor",
          role: "INSTRUCTOR" as const,
          avatar: "/api/placeholder/100/100"
        },
        {
          id: "3",
          email: "admin@example.com",
          name: "Admin User",
          role: "ADMIN" as const,
          avatar: "/api/placeholder/100/100"
        }
      ]

      const foundUser = mockUsers.find(u => u.email === email)
      
      if (foundUser && password === "password") {
        setUser(foundUser)
        localStorage.setItem("user", JSON.stringify(foundUser))
        return true
      }
      
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // In a real app, this would make an API call to your backend
      // Mock signup logic
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: "STUDENT"
      }
      
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
      return true
    } catch (error) {
      console.error("Signup failed:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    // In a real app, you might also clear cookies or make an API call to invalidate the session
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.role === role.toUpperCase()
  }

  const isAuthenticated = !!user

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    hasRole,
    isAuthenticated
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Higher-order component for route protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasRole, loading } = useAuth()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      // Redirect to login
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-4">Please sign in to access this page.</p>
            <a href="/auth/login" className="text-primary hover:underline">
              Go to Login
            </a>
          </div>
        </div>
      )
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role))
      if (!hasRequiredRole) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-muted-foreground mb-4">
                You don't have the required permissions to access this page.
              </p>
              <a href="/" className="text-primary hover:underline">
                Go to Home
              </a>
            </div>
          </div>
        )
      }
    }

    return <Component {...props} />
  }
}