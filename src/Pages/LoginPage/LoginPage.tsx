import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './LoginPage.module.css'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement login logic
    console.log('Login attempt:', { username, password })
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
            />
          </div>

          <button type="submit" className={styles.submitButton}>
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