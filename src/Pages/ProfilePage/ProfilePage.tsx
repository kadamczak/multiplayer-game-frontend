import { useEffect, useState } from 'react'
import './ProfilePage.css'
import { useAuth } from '../../Context/useAuth'
import { useLoading } from '../../Context/useLoading'
import { getUserGameInfoAPI } from '../../Services/UserService'
import type { UserGameInfoResponse } from '../../Models/UserModels'

const ProfilePage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { isLoading, setIsLoading } = useLoading();
  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError('');

      const result = await getUserGameInfoAPI(accessToken, (newToken) => {
        setAccessToken(newToken);
      });

      if (result.success) {
        setUserInfo(result.data);
      } else {
        setError(result.problem.title || 'Failed to load user information');
      }

      setIsLoading(false);
    }

    fetchUserInfo();
  }, [accessToken, setAccessToken]);

  if (isLoading) {
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
      <h1>Profile</h1>
      
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