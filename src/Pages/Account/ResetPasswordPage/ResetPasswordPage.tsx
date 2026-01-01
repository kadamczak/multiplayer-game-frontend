import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from './ResetPasswordPage.module.css'
import { useLoading } from '../../../Context/useLoading'
import { resetPasswordAPI } from '../../../Services/AuthService'
import { USER_VALIDATION_RULES } from '../../../Constants/Validation/UserValidationRules'
import { getFieldErrors } from '../../../Models/ApiResponse'
import { applyServerFieldErrors } from '../../../Helpers/FormHelpers'

type ResetPasswordFormData = {
  newPassword: string
  confirmPassword: string
}

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setIsLoading } = useLoading();
  
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    setIsLoading(false);
    
    // Check if token and email are present
    if (!token || !email) {
      setInvalidLink(true);
    }
  }, [setIsLoading, token, email]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordFormData>({
    mode: 'onBlur',
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !email) {
      setGeneralError(t('resetPassword.invalidResetLink'));
      return;
    }

    setGeneralError('');

    const result = await resetPasswordAPI({
      email,
      resetToken: token,
      newPassword: data.newPassword,
    });

    if (!result.success) {
      const fieldErrors = getFieldErrors(result.problem);

      if (fieldErrors) {
        applyServerFieldErrors(setError, fieldErrors);
      } else {
        setGeneralError(result.problem.title);
      }
      return;
    }

    // Success
    setSuccess(true);
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  if (invalidLink) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>{t('resetPassword.invalidLink')}</h1>
          <p className={styles.error}>
            {t('resetPassword.invalidLinkMessage')}
          </p>
          <p className={styles.loginPrompt}>
            <Link to="/forgot-password" className={styles.loginLink}>
              {t('resetPassword.requestNewLink')}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>{t('resetPassword.title')}</h1>
        
        {!success ? (
          <>
            <p className={styles.description}>
              {t('resetPassword.description')}
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  {t('resetPassword.newPassword')}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  {...register('newPassword', {
                    required: t('resetPassword.passwordRequired'),
                    minLength: {
                      value: USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH,
                      message: t('resetPassword.passwordMinLength', { min: USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH })
                    },
                    maxLength: {
                      value: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH,
                      message: t('resetPassword.passwordMaxLength', { max: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH })
                    }
                  })}
                  className={styles.input}
                />
                {errors.newPassword && (
                  <p className={styles.fieldError}>{errors.newPassword.message}</p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  {t('resetPassword.confirmNewPassword')}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword', {
                    required: t('resetPassword.confirmPasswordRequired'),
                    validate: value => value === newPassword || t('resetPassword.passwordsNoMatch')
                  })}
                  className={styles.input}
                />
                {errors.confirmPassword && (
                  <p className={styles.fieldError}>{errors.confirmPassword.message}</p>
                )}
              </div>

              {generalError && <p className={styles.error}>{generalError}</p>}

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? t('resetPassword.resettingPassword') : t('resetPassword.resetPassword')}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successContainer}>
            <p className={styles.success}>
              {t('resetPassword.successMessage')}
            </p>
            <p className={styles.note}>
              {t('resetPassword.redirecting')}
            </p>
          </div>
        )}

        <p className={styles.loginPrompt}>
          {t('resetPassword.rememberPassword')}{' '}
          <Link to="/login" className={styles.loginLink}>
            {t('resetPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;