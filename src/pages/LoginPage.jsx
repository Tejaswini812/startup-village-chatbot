import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSuccess = (userData, token) => {
    login(userData, token)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '1rem'
    }}>
      <LoginForm
        onClose={() => navigate('/')}
        onSuccess={handleSuccess}
        onShowSignup={() => navigate('/signup')}
      />
    </div>
  )
}
