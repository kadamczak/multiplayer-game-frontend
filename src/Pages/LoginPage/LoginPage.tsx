import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'
import { USER_VALIDATION_RULES } from '../../Constants/Validation/UserValidationRules'
import { loginAPI } from '../../Services/AuthService'


const LoginPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearAllErrors()

    const result = await loginAPI({ username, password })

    // if (!result.success) {
    //   setGeneralError(result.title || 'Login failed')
    //   return
    // }

    // Successful login
    setSuccess(true)

    // Save accessToken in memory
    // (refreshToken is in cookie)


    // Redirect to home page
    navigate("/")
  }

  const clearAllErrors = () => {
    setGeneralError('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Login</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
              minLength={USER_VALIDATION_RULES.USERNAME.MIN_LENGTH}
              maxLength={USER_VALIDATION_RULES.USERNAME.MAX_LENGTH}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              maxLength={USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH}
            />
          </div>

          {generalError && <p className={styles.error}>{generalError}</p>}
          {success && <p className={styles.success}>Login successful!</p>}

          <button type="submit" className={styles.submitButton} disabled={success}>
            Login
          </button>
        </form>

        <p className={styles.registerPrompt}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.registerLink}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage