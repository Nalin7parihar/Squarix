"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext({})

// Configure axios
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
axios.defaults.withCredentials = true

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/user/me')
        setUser(response.data)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])
  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await axios.post('/user/login', { email, password })
      setUser(response.data.user)
      return { success: true, user: response.data.user }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      setLoading(true)
      const response = await axios.post('/user/register', { name, email, password })
      
      // Registration now returns user info with token (automatically logged in)
      setUser(response.data.user)
      return { success: true, user: response.data.user }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await axios.post('/user/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      const response = await axios.put('/user/updatePassword', { oldPassword, newPassword })
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message }
    }
  }

  const deleteAccount = async () => {
    try {
      const response = await axios.delete('/user/deleteAccount')
      setUser(null)
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message }
    }
  }

  const getUsers = async () => {    try {
      const response = await axios.get('/user/users')
      return { success: true, users: response.data.userList }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updatePassword,
        deleteAccount,
        getUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
