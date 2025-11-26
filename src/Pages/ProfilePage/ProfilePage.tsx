import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ProfilePage.module.css'
import { useAuth } from '../../Context/useAuth'
import { useLoading } from '../../Context/useLoading'
import { getUserGameInfoAPI } from '../../Services/UserService'
import type { UserGameInfoResponse } from '../../Models/UserModels'

const ProfilePage = () => {
  const { accessToken, setAccessToken, userName } = useAuth();
  const { setIsLoading } = useLoading();

  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);

  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError('');
      
      const loadingTimer = setTimeout(() => setShowLoading(true), 200);

      const result = await getUserGameInfoAPI(accessToken, (newToken) => {
        setAccessToken(newToken);
      });

      if (result.success) {
        setUserInfo(result.data);
      } else {
        setError(result.problem.title || 'Failed to load user information');
      }

      clearTimeout(loadingTimer);
      setShowLoading(false);
      setIsLoading(false);
    }

    fetchUserInfo();
  }, [accessToken, setAccessToken]);

  if (showLoading) {
    return <div className={styles.profileContainer}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.profileContainer}>Error: {error}</div>;
  }

  if (!userInfo) {
    return <div className={styles.profileContainer}>No user information available</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Profile</h1>
        {userName === userInfo.userName && (
          <Link to="/account-actions" className={styles.manageAccountLink}>
            Manage Account
          </Link>
        )}
      </div>
      
      <div className={styles.profileCard}>
        <div className={styles.profileSection}>
          <label>Username</label>
          <p className={styles.profileValue}>{userInfo.userName}</p>
        </div>

        <div className={styles.profileSection}>
          <label>Account Balance</label>
          <p className={`${styles.profileValue} ${styles.balance}`}>{userInfo.balance} Gems</p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage;