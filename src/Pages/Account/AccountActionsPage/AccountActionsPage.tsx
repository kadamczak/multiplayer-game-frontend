import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from './AccountActionsPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { changePasswordAPI, deleteAccountAPI } from '../../../Services/AuthService'
import { USER_VALIDATION_RULES } from '../../../Constants/Validation/UserValidationRules'
import { getFieldErrors } from '../../../Models/ApiResponse'
import { applyServerFieldErrors } from '../../../Helpers/FormHelpers'

type ChangePasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

type DeleteAccountFormData = {
  currentPassword: string
  confirmDelete: string
}

const AccountActionsPage = () => {
  const { t } = useTranslation();
  const { accessToken, setAccessToken, logout } = useAuth();
  const { setIsLoading } = useLoading();
  
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Change Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    setError: setPasswordError,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword }
  } = useForm<ChangePasswordFormData>({
    mode: 'onBlur',
  });
  
  const newPassword = watchPassword('newPassword');
  

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);


  const onChangePassword = async (data: ChangePasswordFormData) => {
    setChangePasswordError('');
    setChangePasswordSuccess(false);

    const result = await changePasswordAPI(accessToken, setAccessToken, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (!result.success) {
      const fieldErrors = getFieldErrors(result.problem);

      if (fieldErrors) {
        applyServerFieldErrors(setPasswordError, fieldErrors);
      } else {
        setChangePasswordError(result.problem.title);
      }
      return;
    }

    // Success
    setChangePasswordSuccess(true);
    resetPasswordForm();
  };

  // Delete Account Form
  const {
    register: registerDelete,
    handleSubmit: handleSubmitDelete,
    setError: setDeleteError,
    formState: { errors: deleteErrors, isSubmitting: isSubmittingDelete }
  } = useForm<DeleteAccountFormData>({
    mode: 'onBlur',
  });

  const onDeleteAccount = async (data: DeleteAccountFormData) => {
    setDeleteAccountError('');

    const result = await deleteAccountAPI(accessToken, setAccessToken, {
      password: data.currentPassword,
    });

    if (!result.success) {
      const fieldErrors = getFieldErrors(result.problem);

      if (fieldErrors) {
        applyServerFieldErrors(setDeleteError, fieldErrors);
      } else {
        setDeleteAccountError(result.problem.title);
      }
      return;
    }

    logout();
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageWrapper}>
        <h1 className={styles.pageTitle}>{t('account.management')}</h1>

        {/* Change Password Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('account.changePassword')}</h2>
          <form onSubmit={handleSubmitPassword(onChangePassword)} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="currentPassword" className={styles.label}>
                {t('account.currentPassword')}
              </label>
              <input
                type="password"
                id="currentPassword"
                {...registerPassword('currentPassword', {
                  required: t('account.currentPasswordRequired'),
                })}
                className={styles.input}
              />
              {passwordErrors.currentPassword && (
                <p className={styles.fieldError}>{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                {t('account.newPassword')}
              </label>
              <input
                type="password"
                id="newPassword"
                {...registerPassword('newPassword', {
                  required: t('account.newPasswordRequired'),
                  minLength: {
                    value: USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH,
                    message: t('account.passwordMinLength', { min: USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH })
                  },
                  maxLength: {
                    value: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH,
                    message: t('account.passwordMaxLength', { max: USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH })
                  }
                })}
                className={styles.input}
              />
              {passwordErrors.newPassword && (
                <p className={styles.fieldError}>{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmNewPassword" className={styles.label}>
                {t('account.confirmNewPassword')}
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                {...registerPassword('confirmNewPassword', {
                  required: t('account.confirmPassword'),
                  validate: value => value === newPassword || t('account.passwordsNoMatch')
                })}
                className={styles.input}
              />
              {passwordErrors.confirmNewPassword && (
                <p className={styles.fieldError}>{passwordErrors.confirmNewPassword.message}</p>
              )}
            </div>

            {changePasswordError && <p className={styles.error}>{changePasswordError}</p>}
            {changePasswordSuccess && (
              <p className={styles.success}>{t('account.passwordChangedSuccess')}</p>
            )}

            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={isSubmittingPassword || changePasswordSuccess}
            >
              {isSubmittingPassword ? t('account.changingPassword') : t('account.changePassword')}
            </button>
          </form>
        </div>

        {/* Delete Account Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('account.deleteAccount')}</h2>
          <p className={styles.warningText}>
            {t('account.deleteWarning')}
          </p>

          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className={styles.dangerButton}
            >
              {t('account.deleteMyAccount')}
            </button>
          ) : (
            <form onSubmit={handleSubmitDelete(onDeleteAccount)} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="deleteCurrentPassword" className={styles.label}>
                  {t('account.currentPassword')}
                </label>
                <input
                  type="password"
                  id="deleteCurrentPassword"
                  {...registerDelete('currentPassword', {
                    required: t('account.passwordRequiredToDelete'),
                  })}
                  className={styles.input}
                />
                {deleteErrors.currentPassword && (
                  <p className={styles.fieldError}>{deleteErrors.currentPassword.message}</p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmDelete" className={styles.label}>
                  {t('account.confirmDelete')}
                </label>
                <input
                  type="text"
                  id="confirmDelete"
                  {...registerDelete('confirmDelete', {
                    required: t('account.typeDELETEToConfirm'),
                    validate: value => value === 'DELETE' || t('account.mustTypeDELETE')
                  })}
                  className={styles.input}
                  placeholder={t('account.typeDelete')}
                />
                {deleteErrors.confirmDelete && (
                  <p className={styles.fieldError}>{deleteErrors.confirmDelete.message}</p>
                )}
              </div>

              {deleteAccountError && <p className={styles.error}>{deleteAccountError}</p>}

              <div className={styles.buttonGroup}>
                <button 
                  type="submit" 
                  className={styles.dangerButton} 
                  disabled={isSubmittingDelete}
                >
                  {isSubmittingDelete ? t('account.deletingAccount') : t('account.confirmDeleteAction')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className={styles.cancelButton}
                  disabled={isSubmittingDelete}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountActionsPage;