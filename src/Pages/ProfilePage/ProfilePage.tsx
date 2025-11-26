import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './ProfilePage.module.css'
import { useAuth } from '../../Context/useAuth'
import { useLoading } from '../../Context/useLoading'
import { getUserGameInfoAPI, uploadProfilePictureAPI, deleteProfilePictureAPI } from '../../Services/UserService'
import { fetchImageWithCache } from '../../Services/ApiMethodHelpers'
import type { UserGameInfoResponse } from '../../Models/UserModels'

const ProfilePage = () => {
  const { accessToken, setAccessToken, userName } = useAuth();
  const { setIsLoading } = useLoading();

  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');

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
        
        // Load profile picture
        if (result.data.profilePictureUrl) {
          const imageUrl = await fetchImageWithCache(result.data.profilePictureUrl, accessToken);
          setProfilePictureUrl(imageUrl);
        } else {
          setProfilePictureUrl('/emptyprofilepicture.png');
        }
      } else {
        setError(result.problem.title || 'Failed to load user information');
      }

      clearTimeout(loadingTimer);
      setShowLoading(false);
      setIsLoading(false);
    }

    fetchUserInfo();
  }, [accessToken, setAccessToken]);

  const handleChangePicture = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsLoading(true);

    const result = await uploadProfilePictureAPI(accessToken, setAccessToken, file);

    if (result.success) {
      // Refresh user info to get new profile picture URL
      const userInfoResult = await getUserGameInfoAPI(accessToken, setAccessToken);
      if (userInfoResult.success) {
        setUserInfo(userInfoResult.data);
        
        if (userInfoResult.data.profilePictureUrl) {
          const imageUrl = await fetchImageWithCache(userInfoResult.data.profilePictureUrl, accessToken);
          setProfilePictureUrl(imageUrl);
        }
      }
    } else {
      setUploadError(result.problem.title || 'Failed to upload picture');
    }

    setIsLoading(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePicture = async () => {
    setUploadError('');
    setIsLoading(true);

    const result = await deleteProfilePictureAPI(accessToken, setAccessToken);

    if (result.success) {
      // Update userInfo to reflect removed profile picture
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          profilePictureUrl: undefined
        });
      }
      setProfilePictureUrl('/emptyprofilepicture.png');
    } else {
      setUploadError(result.problem.title || 'Failed to remove picture');
    }

    setIsLoading(false);
  };

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
        <div className={styles.profilePictureContainer}>
          <img 
            src={profilePictureUrl || '/emptyprofilepicture.png'} 
            alt="Profile Picture"
            className={styles.profilePicture}
          />
          {userName === userInfo.userName && (
            <div className={styles.pictureActions}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className={styles.fileInput}
              />
              <button onClick={handleChangePicture} className={styles.changePictureButton}>
                Change Picture
              </button>
              {userInfo.profilePictureUrl && (
                <button onClick={handleRemovePicture} className={styles.removePictureButton}>
                  Remove
                </button>
              )}
              {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
            </div>
          )}
        </div>
        
        <div className={styles.profileInfo}>
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
    </div>
  )
}

export default ProfilePage;