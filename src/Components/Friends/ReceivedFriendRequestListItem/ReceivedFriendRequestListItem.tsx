import { useTranslation } from 'react-i18next';
import type { FriendRequestResponse } from '../../../Models/FriendModels';
import styles from './ReceivedFriendRequestListItem.module.css';

interface ReceivedFriendRequestListItemProps {
  request: FriendRequestResponse;
  profilePictureUrl?: string;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const ReceivedFriendRequestListItem = ({ 
  request, 
  profilePictureUrl, 
  onAccept, 
  onReject 
}: ReceivedFriendRequestListItemProps) => {
  const { t } = useTranslation();

  return (
    <li className={styles.listItem}>
      {profilePictureUrl ? (
        <img 
          src={profilePictureUrl} 
          alt={request.requesterUserName}
          className={styles.profilePicture}
        />
      ) : (
        <div className={styles.profilePicturePlaceholder}>
          {request.requesterUserName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={styles.userInfo}>
        <h3 className={styles.userName}>{request.requesterUserName}</h3>
        <p className={styles.userDetail}>
          {t('friends.receivedDate')} {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className={styles.requestActions}>
        <button
          className={styles.acceptButton}
          onClick={() => onAccept(request.id)}
        >
          {t('friends.accept')}
        </button>
        <button
          className={styles.declineButton}
          onClick={() => onReject(request.id)}
        >
          {t('friends.decline')}
        </button>
      </div>
    </li>
  );
};

export default ReceivedFriendRequestListItem;
