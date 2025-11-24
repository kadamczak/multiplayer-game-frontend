import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './ProfilePage.css'
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
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container">Error: {error}</div>;
  }

  if (!userInfo) {
    return <div className="profile-container">No user information available</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        {userName === userInfo.userName && (
          <Link to="/account-actions" className="manage-account-link">
            Manage Account
          </Link>
        )}
      </div>
      
      <div className="profile-card">
        <div className="profile-section">
          <label>Username</label>
          <p className="profile-value">{userInfo.userName}</p>
        </div>

        <div className="profile-section">
          <label>Account Balance</label>
          <p className="profile-value balance">{userInfo.balance} Gems</p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage;