import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './RegisterPage.module.css'
import { register } from '../../Services/AuthService'
import { USER_VALIDATION_RULES } from '../../Constants/Validation/UserValidationRules'

const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')

  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    clearAllErrors()

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }


    const result = await register({ username, email, password })

    if (!result.success) {
      if (result.errors) {
        // Set field-specific errors

        console.log(result.errors)

        if (result.errors.UserName) {
          setUsernameError(result.errors.UserName.join('\n'))
        }
        if (result.errors.Email) {
          setEmailError(result.errors.Email.join('\n'))
        }
        if (result.errors.Password) {
          setPasswordError(result.errors.Password.join('\n'))
        }

      } else {
        // Set general error
        setGeneralError(result.title || 'Registration failed')
      }
      return
    }

    // Successful registration
    setSuccess(true)
  }

  const clearAllErrors = () => {
      setUsernameError('')
      setEmailError('')
      setPasswordError('')
      setGeneralError('')
  }


  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Register</h1>
        
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
            {usernameError && <p className={styles.fieldError}>{usernameError}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              minLength={USER_VALIDATION_RULES.EMAIL.MIN_LENGTH}
              maxLength={USER_VALIDATION_RULES.EMAIL.MAX_LENGTH}
            />
            {emailError && <p className={styles.fieldError}>{emailError}</p>}
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
              minLength={USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH}
              maxLength={USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH}
            />
            {passwordError && <p className={styles.fieldError}>{passwordError}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {generalError && <p className={styles.error}>{generalError}</p>}
          {success && <p className={styles.success}>Registration successful!</p>}

          <button type="submit" className={styles.submitButton} disabled={success}>
            Register
          </button>
        </form>

        <p className={styles.loginPrompt}>
          Already have an account?{' '}
          <Link to="/login" className={styles.loginLink}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage