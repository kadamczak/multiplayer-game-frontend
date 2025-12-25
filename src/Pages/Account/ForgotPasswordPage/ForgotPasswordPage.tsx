import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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
        <h1 className={styles.title}>Forgot Password</h1>
        
        {!success ? (
          <>
            <p className={styles.description}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
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
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
              </div>

              {generalError && <p className={styles.error}>{generalError}</p>}

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successContainer}>
            <p className={styles.success}>
              Success! If your email is registered with us, you will receive a password reset link shortly.
            </p>
            <p className={styles.note}>
              If you don't receive an email within a few minutes, please check your spam folder.
            </p>
          </div>
        )}

        <p className={styles.loginPrompt}>
          <Link to="/login" className={styles.loginLink}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;