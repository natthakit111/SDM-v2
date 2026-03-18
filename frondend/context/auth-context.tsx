'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'admin' | 'tenant'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  roomNumber?: string
  phone?: string
  telegramId?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for testing
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'ผู้ดูแลระบบ',
    role: 'admin',
    phone: '081-234-5678',
  },
  {
    id: '2',
    email: 'tenant@example.com',
    password: 'tenant123',
    name: 'สมชาย ใจดี',
    role: 'tenant',
    roomNumber: '101',
    phone: '089-876-5432',
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('dormflow_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('dormflow_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('dormflow_user', JSON.stringify(userWithoutPassword))
      return { success: true }
    }
    
    return { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
  }

  const register = async (data: RegisterData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if email already exists
    if (MOCK_USERS.find(u => u.email === data.email)) {
      return { success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' }
    }

    // Create new user (in real app, this would be saved to database)
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: 'tenant',
      phone: data.phone,
    }

    setUser(newUser)
    localStorage.setItem('dormflow_user', JSON.stringify(newUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dormflow_user')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
