import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styles from './ConfirmEmailPage.module.css'
import { useLoading } from '../../../Context/useLoading'
import { confirmEmailAPI } from '../../../Services/AuthService'

const ConfirmEmailPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { setIsLoading } = useLoading();
  
  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    setIsLoading(false);
    
    // Check if token and email are present
    if (!token || !email) {
      setInvalidLink(true);
      setIsConfirming(false);
      return;
    }

    // Automatically confirm email on page load
    const confirmEmail = async () => {
      setIsConfirming(true);
      setError('');

      const result = await confirmEmailAPI({
        email,
        token,
      });

      setIsConfirming(false);

      if (!result.success) {
        setError(result.problem.title);
        return;
      }

      // Success
      setSuccess(true);
    };

    confirmEmail();
  }, [token, email]);

  if (invalidLink) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>{t('confirmEmail.invalidLink')}</h1>
          <p className={styles.error}>
            {t('confirmEmail.invalidLinkMessage')}
          </p>
          <p className={styles.loginPrompt}>
            <Link to="/login" className={styles.loginLink}>
              {t('confirmEmail.goToLogin')}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>{t('confirmEmail.title')}</h1>
        
        {isConfirming && (
          <div className={styles.loadingContainer}>
            <p className={styles.loading}>{t('confirmEmail.confirming')}</p>
          </div>
        )}

        {!isConfirming && success && (
          <div className={styles.successContainer}>
            <p className={styles.success}>
              {t('confirmEmail.successMessage')}
            </p>
            <p className={styles.loginPrompt}>
              <Link to="/login" className={styles.loginLink}>
                {t('confirmEmail.proceedToLogin')}
              </Link>
            </p>
          </div>
        )}

        {!isConfirming && error && (
          <>
            <p className={styles.error}>{error}</p>
            <p className={styles.loginPrompt}>
              <Link to="/login" className={styles.loginLink}>
                {t('confirmEmail.goToLogin')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailPage;