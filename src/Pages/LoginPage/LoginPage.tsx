import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'
import { USER_VALIDATION_RULES } from '../../Constants/Validation/UserValidationRules'
import { useAuth } from '../../Context/useAuth'
import { useForm } from 'react-hook-form'
import { getFieldErrors } from '../../Models/ApiResponse'
import { applyServerFieldErrors } from '../../Helpers/FormHelpers'

type LoginFormData = {
  userName: string
  password: string
}


const LoginPage = () => {
  const navigate = useNavigate();
  const {loginUser} = useAuth();
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const {
      register,
      handleSubmit,
      setError,
      formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
      mode: 'onBlur',
    })

  const onSubmit = async (data: LoginFormData) => {

    const result = await loginUser({
      username: data.userName,
      password: data.password,
    })

    if (!result.success) {
      const fieldErrors = getFieldErrors(result.problem)

      if (fieldErrors) {
        applyServerFieldErrors(setError, fieldErrors)
        setGeneralError('')
      } else {
        setGeneralError(result.problem.title)
      }
      return
    }

    // Successful login
    setSuccess(true)
    
    // Redirect to home page after 1 second
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }


  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Login</h1>
        
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
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Password is required',
                maxLength: {
                  value: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH,
                  message: `Password must not exceed ${USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`
                }
              })}
              className={styles.input}
            />
            {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
          </div>

          {generalError && <p className={styles.error}>{generalError}</p>}
          {success && <p className={styles.success}>Login successful!</p>}

          <button type="submit" className={styles.submitButton} disabled={isSubmitting || success}>
            {isSubmitting ? 'Logging in...' : 'Login'}
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