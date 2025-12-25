import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import styles from './ConfirmEmailPage.module.css'
import { useLoading } from '../../../Context/useLoading'
import { confirmEmailAPI } from '../../../Services/AuthService'

const ConfirmEmailPage = () => {
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
          <h1 className={styles.title}>Invalid Confirmation Link</h1>
          <p className={styles.error}>
            This email confirmation link is invalid or has expired.
          </p>
          <p className={styles.loginPrompt}>
            <Link to="/login" className={styles.loginLink}>
              Go to Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Email Confirmation</h1>
        
        {isConfirming && (
          <div className={styles.loadingContainer}>
            <p className={styles.loading}>Confirming your email...</p>
          </div>
        )}

        {!isConfirming && success && (
          <div className={styles.successContainer}>
            <p className={styles.success}>
              Your email has been successfully confirmed! You can now log in to your account.
            </p>
            <p className={styles.loginPrompt}>
              <Link to="/login" className={styles.loginLink}>
                Proceed to Login
              </Link>
            </p>
          </div>
        )}

        {!isConfirming && error && (
          <>
            <p className={styles.error}>{error}</p>
            <p className={styles.loginPrompt}>
              <Link to="/login" className={styles.loginLink}>
                Go to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailPage;