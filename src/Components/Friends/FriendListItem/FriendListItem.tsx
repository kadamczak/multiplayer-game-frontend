import { useTranslation } from 'react-i18next';
import type { FriendResponse } from '../../../Models/FriendModels';
import styles from './FriendListItem.module.css';

interface FriendListItemProps {
  friend: FriendResponse;
  profilePictureUrl?: string;
  onRemove: (userId: string, userName: string) => void;
}

const FriendListItem = ({ friend, profilePictureUrl, onRemove }: FriendListItemProps) => {
  const { t } = useTranslation();

  return (
    <li className={styles.listItem}>
      {profilePictureUrl ? (
        <img 
          src={profilePictureUrl} 
          alt={friend.userName}
          className={styles.profilePicture}
        />
      ) : (
        <div className={styles.profilePicturePlaceholder}>
          {friend.userName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={styles.userInfo}>
        <h3 className={styles.userName}>{friend.userName}</h3>
        <p className={styles.userDetail}>
          {t('friends.friendsSince')} {new Date(friend.friendsSince).toLocaleDateString()}
        </p>
      </div>
      <div className={styles.requestActions}>
        <button
          className={styles.removeButton}
          onClick={() => onRemove(friend.userId, friend.userName)}
        >
          {t('friends.remove')}
        </button>
      </div>
    </li>
  );
};

export default FriendListItem;
