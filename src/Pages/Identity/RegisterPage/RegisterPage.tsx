import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from './RegisterPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { USER_VALIDATION_RULES } from '../../../Constants/Validation/UserValidationRules'
import { getFieldErrors } from '../../../Models/ApiResponse'
import { applyServerFieldErrors } from '../../../Helpers/FormHelpers'

type RegisterFormData = {
  userName: string
  email: string
  password: string
  confirmPassword: string
}

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const { setIsLoading } = useLoading();
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const {
    register,
    handleSubmit,
    watch, // for dependent validation (e.g., confirm password)
    setError,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    mode: 'onBlur',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setGeneralError('');

    const result = await registerUser({
      userName: data.userName,
      email: data.email,
      password: data.password,
    });

    if (!result.success) {
      const fieldErrors = getFieldErrors(result.problem);

      if (fieldErrors) {
        applyServerFieldErrors(setError, fieldErrors);
      } else {
        setGeneralError(result.problem.title);
      }
      return
    }

    setSuccess(true);
    
    setTimeout(() => {
      navigate('/login')
    }, 4000);
  }


  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>{t('auth.register')}</h1>
        
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
            <label htmlFor="email" className={styles.label}>
              {t('auth.email')}
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: t('auth.emailRequired'),
                maxLength: {
                  value: USER_VALIDATION_RULES.EMAIL.MAX_LENGTH,
                  message: t('auth.emailMaxLength', { max: USER_VALIDATION_RULES.EMAIL.MAX_LENGTH })
                }
              })}
              className={styles.input}
            />
            {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
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
                minLength: {
                  value: USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH,
                  message: t('auth.passwordMinLength', { min: USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH })
                },
                maxLength: {
                  value: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH,
                  message: t('auth.passwordMaxLength', { max: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH })
                }
              })}
              className={styles.input}
            />
            {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: t('auth.confirmPasswordRequired'),
                validate: value => value === password || t('auth.passwordsNoMatch')
              })}
              className={styles.input}
            />
            {errors.confirmPassword && <p className={styles.fieldError}>{errors.confirmPassword.message}</p>}
          </div>

          {generalError && <p className={styles.error}>{generalError}</p>}
          {success && <p className={styles.success}>{t('auth.registrationSuccessful')}</p>}

          <button type="submit" className={styles.submitButton} disabled={isSubmitting || success}>
            {isSubmitting ? t('auth.registering') : t('auth.register')}
          </button>
        </form>

        <p className={styles.loginPrompt}>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className={styles.loginLink}>
            {t('auth.loginHere')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage;