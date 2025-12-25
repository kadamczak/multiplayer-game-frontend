import type { FriendRequestResponse } from '../../../Models/FriendModels';
import styles from './SentFriendRequestListItem.module.css';

interface SentFriendRequestListItemProps {
  request: FriendRequestResponse;
  profilePictureUrl?: string;
  onCancel: (requestId: string) => void;
}

const SentFriendRequestListItem = ({ request, profilePictureUrl, onCancel }: SentFriendRequestListItemProps) => {
  const isPending = request.status.toLowerCase() === 'pending';

  return (
    <li className={styles.listItem}>
      {profilePictureUrl ? (
        <img 
          src={profilePictureUrl} 
          alt={request.receiverUserName}
          className={styles.profilePicture}
        />
      ) : (
        <div className={styles.profilePicturePlaceholder}>
          {request.receiverUserName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={styles.userInfo}>
        <h3 className={styles.userName}>{request.receiverUserName}</h3>
        <p className={styles.userDetail}>
          Sent: {new Date(request.createdAt).toLocaleDateString()}
        </p>
        {request.respondedAt && (
          <p className={styles.userDetail}>
            Responded: {new Date(request.respondedAt).toLocaleDateString()}
          </p>
        )}
        <span className={`${styles.statusBadge} ${styles.statusPending}`}>
          {request.status}
        </span>
      </div>
      <div className={styles.requestActions}>
        <button
          className={styles.cancelButton}
          onClick={() => onCancel(request.id)}
          disabled={!isPending}
        >
          {isPending ? 'Cancel' : 'Remove'}
        </button>
      </div>
    </li>
  );
};

export default SentFriendRequestListItem;
