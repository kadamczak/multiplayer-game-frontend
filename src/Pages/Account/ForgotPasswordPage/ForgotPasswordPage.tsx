import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from './ForgotPasswordPage.module.css'
import { useLoading } from '../../../Context/useLoading'
import { forgotPasswordAPI } from '../../../Services/AuthService'
import { USER_VALIDATION_RULES } from '../../../Constants/Validation/UserValidationRules'
import { getFieldErrors } from '../../../Models/ApiResponse'
import { applyServerFieldErrors } from '../../../Helpers/FormHelpers'

type ForgotPasswordFormData = {
  email: string
}

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { setIsLoading } = useLoading();
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordFormData>({
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setGeneralError('');

    const result = await forgotPasswordAPI({
      email: data.email,
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

    setSuccess(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>{t('forgotPassword.title')}</h1>
        
        {!success ? (
          <>
            <p className={styles.description}>
              {t('forgotPassword.description')}
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  {t('forgotPassword.emailAddress')}
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', {
                    required: t('forgotPassword.emailRequired'),
                    maxLength: {
                      value: USER_VALIDATION_RULES.EMAIL.MAX_LENGTH,
                      message: t('forgotPassword.emailMaxLength', { max: USER_VALIDATION_RULES.EMAIL.MAX_LENGTH })
                    }
                  })}
                  className={styles.input}
                  placeholder={t('forgotPassword.emailPlaceholder')}
                />
                {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
              </div>

              {generalError && <p className={styles.error}>{generalError}</p>}

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successContainer}>
            <p className={styles.success}>
              {t('forgotPassword.successMessage')}
            </p>
            <p className={styles.note}>
              {t('forgotPassword.successNote')}
            </p>
          </div>
        )}

        <p className={styles.loginPrompt}>
          <Link to="/login" className={styles.loginLink}>
            {t('forgotPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;