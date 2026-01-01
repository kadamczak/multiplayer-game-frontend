import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from './LoginPage.module.css'
import { USER_VALIDATION_RULES } from '../../../Constants/Validation/UserValidationRules'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getFieldErrors } from '../../../Models/ApiResponse'
import { applyServerFieldErrors } from '../../../Helpers/FormHelpers'

type LoginFormData = {
  userName: string
  password: string
}


const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {loginUser} = useAuth();
  const { setIsLoading } = useLoading();
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState(false)
  
  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);
  
  const {
      register,
      handleSubmit,
      setError,
      formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
      mode: 'onBlur',
    });

  const onSubmit = async (data: LoginFormData) => {

    const result = await loginUser({
      username: data.userName,
      password: data.password,
    });

    if (!result.success) {
      const fieldErrors = getFieldErrors(result.problem);

      if (fieldErrors) {
        applyServerFieldErrors(setError, fieldErrors);
        setGeneralError('');
      } else {
        setGeneralError(result.problem.title);
      }
      return;
    }

    // Successful login
    setSuccess(true);
    
    // Redirect to home page after 1 second
    setTimeout(() => {
      navigate('/')
    }, 1000);
  }


  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>{t('auth.login')}</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="userName" className={styles.label}>
              {t('auth.userName')}
            </label>
            <input
              type="text"
              id="userName"
              {...register('userName', {
                required: t('auth.usernameRequired'),
                minLength: {
                  value: USER_VALIDATION_RULES.USERNAME.MIN_LENGTH,
                  message: t('auth.usernameMinLength', { min: USER_VALIDATION_RULES.USERNAME.MIN_LENGTH })
                },
                maxLength: {
                  value: USER_VALIDATION_RULES.USERNAME.MAX_LENGTH,
                  message: t('auth.usernameMaxLength', { max: USER_VALIDATION_RULES.USERNAME.MAX_LENGTH })
                }
              })}
              className={styles.input}
            />
            {errors.userName && <p className={styles.fieldError}>{errors.userName.message}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: t('auth.passwordRequired'),
                maxLength: {
                  value: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH,
                  message: t('auth.passwordMaxLength', { max: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH })
                }
              })}
              className={styles.input}
            />
            {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
          </div>

          {generalError && <p className={styles.error}>{generalError}</p>}
          {success && <p className={styles.success}>{t('auth.loginSuccessful')}</p>}

          <button type="submit" className={styles.submitButton} disabled={isSubmitting || success}>
            {isSubmitting ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <p className={styles.forgotPasswordPrompt}>
          <Link to="/forgot-password" className={styles.forgotPasswordLink}>
            {t('auth.forgotYourPassword')}
          </Link>
        </p>

        <p className={styles.registerPrompt}>
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className={styles.registerLink}>
            {t('auth.registerHere')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage;