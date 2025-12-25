import { useState } from 'react';
import type { UserSearchResultResponse } from '../../../Models/UserModels';
import styles from './SearchableUserListItem.module.css';

interface SearchableUserListItemProps {
  user: UserSearchResultResponse;
  profilePictureUrl?: string;
  onSendRequest: (userId: string) => Promise<boolean>;
}

const SearchableUserListItem = ({ 
  user, 
  profilePictureUrl, 
  onSendRequest,
}: SearchableUserListItemProps) => {
  const [requestState, setRequestState] = useState<'none' | 'pending' | 'sending' | 'canceling'>('none');

  const handleSendRequest = async () => {
    setRequestState('sending');
    const success = await onSendRequest(user.id);
    if (success) {
      setRequestState('pending');
    } else {
      setRequestState('none');
    }
  };

  return (
    <li className={styles.listItem}>
      {profilePictureUrl ? (
        <img 
          src={profilePictureUrl} 
          alt={user.userName}
          className={styles.profilePicture}
        />
      ) : (
        <div className={styles.profilePicturePlaceholder}>
          {user.userName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={styles.userInfo}>
        <h3 className={styles.userName}>{user.userName}</h3>
      </div>
      <div className={styles.requestActions}>
        {requestState === 'none' && (
          <button
            className={styles.sendButton}
            onClick={handleSendRequest}
          >
            Send Friend Request
          </button>
        )}
        {requestState === 'sending' && (
          <span className={styles.statusText}>Sending...</span>
        )}
        {requestState === 'pending' && (
          <>
            <span className={styles.statusText}>Sent</span>
          </>
        )}
        {requestState === 'canceling' && (
          <span className={styles.statusText}>Canceling...</span>
        )}
      </div>
    </li>
  );
};

export default SearchableUserListItem;
