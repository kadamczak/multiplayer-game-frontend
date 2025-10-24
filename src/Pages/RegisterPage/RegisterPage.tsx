import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import styles from './RegisterPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { USER_VALIDATION_RULES } from '../../Constants/Validation/UserValidationRules'
import { getFieldErrors } from '../../Models/ApiResponse'

type RegisterFormData = {
  userName: string
  email: string
  password: string
  confirmPassword: string
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const { registerUser } = useAuth()
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    mode: 'onBlur',
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setGeneralError('')

    const result = await registerUser({
      userName: data.userName,
      email: data.email,
      password: data.password,
    })

    if (!result.success) {
      // Handle field-specific errors from ASP.NET validation
      const fieldErrors = getFieldErrors(result.problem)
      console.log(fieldErrors)
      
      if (fieldErrors) {
        // Set errors for each field
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof RegisterFormData, {
            type: 'server',
            message: message
          })
        })
      } else {
        // Set general error if no field-specific errors
        setGeneralError(result.problem.title)
      }
      return
    }

    // Successful registration
    setSuccess(true)
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      navigate('/login')
    }, 2000)
  }


  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Register</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="userName" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="userName"
              {...register('userName', {
                required: 'Username is required',
                // pattern: regex
                minLength: {
                  value: USER_VALIDATION_RULES.USERNAME.MIN_LENGTH,
                  message: `Username must be at least ${USER_VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`
                },
                maxLength: {
                  value: USER_VALIDATION_RULES.USERNAME.MAX_LENGTH,
                  message: `Username must not exceed ${USER_VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`
                }
              })}
              className={styles.input}
            />
            {errors.userName && <p className={styles.fieldError}>{errors.userName.message}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email is required',
                maxLength: {
                  value: USER_VALIDATION_RULES.EMAIL.MAX_LENGTH,
                  message: `Email must not exceed ${USER_VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`
                }
              })}
              className={styles.input}
            />
            {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH,
                  message: `Password must be at least ${USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`
                },
                maxLength: {
                  value: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH,
                  message: `Password must not exceed ${USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`
                }
              })}
              className={styles.input}
            />
            {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              className={styles.input}
            />
            {errors.confirmPassword && <p className={styles.fieldError}>{errors.confirmPassword.message}</p>}
          </div>

          {generalError && <p className={styles.error}>{generalError}</p>}
          {success && <p className={styles.success}>Registration successful! Redirecting to login...</p>}

          <button type="submit" className={styles.submitButton} disabled={isSubmitting || success}>
            {isSubmitting ? 'Registering...' : 'Register'}
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