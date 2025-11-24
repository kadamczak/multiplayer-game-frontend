import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import styles from './ResetPasswordPage.module.css'
import { useLoading } from '../../Context/useLoading'
import { resetPasswordAPI } from '../../Services/AuthService'
import { USER_VALIDATION_RULES } from '../../Constants/Validation/UserValidationRules'
import { getFieldErrors } from '../../Models/ApiResponse'
import { applyServerFieldErrors } from '../../Helpers/FormHelpers'

type ResetPasswordFormData = {
  newPassword: string
  confirmPassword: string
}

const ResetPasswordPage = () => {
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
      setGeneralError('Invalid reset link');
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
          <h1 className={styles.title}>Invalid Reset Link</h1>
          <p className={styles.error}>
            This password reset link is invalid or has expired.
          </p>
          <p className={styles.loginPrompt}>
            <Link to="/forgot-password" className={styles.loginLink}>
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Reset Password</h1>
        
        {!success ? (
          <>
            <p className={styles.description}>
              Enter your new password below.
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  {...register('newPassword', {
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
                {errors.newPassword && (
                  <p className={styles.fieldError}>{errors.newPassword.message}</p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                  className={styles.input}
                />
                {errors.confirmPassword && (
                  <p className={styles.fieldError}>{errors.confirmPassword.message}</p>
                )}
              </div>

              {generalError && <p className={styles.error}>{generalError}</p>}

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successContainer}>
            <p className={styles.success}>
              Password reset successful! You can now log in with your new password.
            </p>
            <p className={styles.note}>
              Redirecting to login page...
            </p>
          </div>
        )}

        <p className={styles.loginPrompt}>
          Remember your password?{' '}
          <Link to="/login" className={styles.loginLink}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;