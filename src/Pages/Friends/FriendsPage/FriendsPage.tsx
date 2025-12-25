import { useEffect, useState, useCallback } from 'react'
import styles from './FriendsPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getReceivedFriendRequestsAPI, getFriendsAPI } from '../../../Services/FriendService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import type { FriendRequestResponse, FriendResponse } from '../../../Models/FriendModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { usePagedData } from '../../../Helpers/usePagedData'
import FilterControls, { type SortOption } from '../../../Components/ResultFiltering/FilterControls/FilterControls'
import Pagination from '../../../Components/ResultFiltering/Pagination/Pagination'
import { Link } from 'react-router-dom'

const REQUESTS_SORT_OPTIONS: SortOption[] = [
  { value: 'UserName', label: 'Username' },
  { value: 'CreatedAt', label: 'Date Received' },
];

const FRIENDS_SORT_OPTIONS: SortOption[] = [
  { value: 'UserName', label: 'Username' },
  { value: 'FriendsSince', label: 'Friends Since' },
];

const FriendsPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  
  const [requestProfilePictures, setRequestProfilePictures] = useState<Map<string, string>>(new Map());
  const [friendProfilePictures, setFriendProfilePictures] = useState<Map<string, string>>(new Map());

  const fetchRequests = useCallback(
    (query: PagedQuery) => getReceivedFriendRequestsAPI(accessToken, setAccessToken, query),
    [accessToken, setAccessToken]
  );

  const fetchFriends = useCallback(
    (query: PagedQuery) => getFriendsAPI(accessToken, setAccessToken, query),
    [accessToken, setAccessToken]
  );

  const requestsData = usePagedData<FriendRequestResponse>({
    fetchFunction: fetchRequests,
    defaultSortBy: 'UserName',
    onLoadingChange: setIsLoading,
  });

  const friendsData = usePagedData<FriendResponse>({
    fetchFunction: fetchFriends,
    defaultSortBy: 'UserName',
    onLoadingChange: setIsLoading,
  });

  
  useEffect(() => {
    if (requestsData.pagedResponse) {
      loadRequestProfilePictures(requestsData.pagedResponse.items);
    }
  }, [requestsData.pagedResponse]);

  useEffect(() => {
    if (friendsData.pagedResponse) {
      loadFriendProfilePictures(friendsData.pagedResponse.items);
    }
  }, [friendsData.pagedResponse]);

  const loadRequestProfilePictures = async (requests: FriendRequestResponse[]) => {
    const newPictures = new Map<string, string>();
    await Promise.all(
      requests.map(async (request) => {
        if (request.requesterProfilePictureUrl) {
          const pictureUrl = await fetchImageWithCache(request.requesterProfilePictureUrl, accessToken);
          if (pictureUrl) {
            newPictures.set(request.id, pictureUrl);
          }
        }
      })
    );
    setRequestProfilePictures(newPictures);
  };


  const loadFriendProfilePictures = async (friends: FriendResponse[]) => {
    const newPictures = new Map<string, string>();
    await Promise.all(
      friends.map(async (friend) => {
        if (friend.profilePictureUrl) {
          const pictureUrl = await fetchImageWithCache(friend.profilePictureUrl, accessToken);
          if (pictureUrl) {
            newPictures.set(friend.userId, pictureUrl);
          }
        }
      })
    );
    setFriendProfilePictures(newPictures);
  };

  const handleAcceptRequest = async (requestId: string) => {
    // TODO: Implement accept request API call
    console.log('Accept request:', requestId);
  };

  const handleDeclineRequest = async (requestId: string) => {
    // TODO: Implement decline request API call
    console.log('Decline request:', requestId);
  };

  if (requestsData.showLoading || friendsData.showLoading) {
    return <div className={styles.container}>Loading...</div>;
  }
  
  return (
    <div className={styles.container}>
      {(requestsData.loadingState === 'refreshing' || friendsData.loadingState === 'refreshing') && (
        <div className={styles.refreshIndicator}>
          Updating...
        </div>
      )}

      <div className={styles.header}>
        <h1>Friends</h1>
        <div className={styles.headerRight}>
          <Link to="/friends/requests/sent" className={styles.sentRequestsButton}>
            Sent Requests
          </Link>
        </div>
      </div>

      {requestsData.error && <div className={styles.error}>{requestsData.error}</div>}
      {friendsData.error && <div className={styles.error}>{friendsData.error}</div>}

      {/* Friend Requests Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>Friend Requests</h2>

        <FilterControls
          query={requestsData.query}
          onQueryChange={requestsData.setQuery}
          sortOptions={REQUESTS_SORT_OPTIONS}
          searchPlaceholder="Search friend requests..."
        />

        {requestsData.pagedResponse && requestsData.pagedResponse.items.length === 0 ? (
          <div className={styles.emptyState}>No pending friend requests.</div>
        ) : (
          <ul className={styles.list}>
            {requestsData.pagedResponse && requestsData.pagedResponse.items.map((request) => (
              <li key={request.id}>
                {requestProfilePictures.get(request.id) ? (
                  <img 
                    src={requestProfilePictures.get(request.id)} 
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
                    Received: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.requestActions}>
                  <button
                    className={styles.acceptButton}
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    Accept
                  </button>
                  <button
                    className={styles.declineButton}
                    onClick={() => handleDeclineRequest(request.id)}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {requestsData.pagedResponse && (
          <Pagination
            pagedResponse={requestsData.pagedResponse}
            currentPage={requestsData.query.pageNumber || 1}
            onPageChange={(page) => requestsData.setQuery({ ...requestsData.query, pageNumber: page })}
            itemLabel="requests"
          />
        )}
      </div>

      {/* Friends Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>My Friends</h2>

        <FilterControls
          query={friendsData.query}
          onQueryChange={friendsData.setQuery}
          sortOptions={FRIENDS_SORT_OPTIONS}
          searchPlaceholder="Search friends..."
        />

        {friendsData.pagedResponse && friendsData.pagedResponse.items.length === 0 ? (
          <div className={styles.emptyState}>No friends yet. Start by accepting friend requests!</div>
        ) : (
          <ul className={styles.list}>
            {friendsData.pagedResponse && friendsData.pagedResponse.items.map((friend) => (
              <li key={friend.userId}>
                {friendProfilePictures.get(friend.userId) ? (
                  <img 
                    src={friendProfilePictures.get(friend.userId)} 
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
                    Friends since: {new Date(friend.friendsSince).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {friendsData.pagedResponse && (
          <Pagination
            pagedResponse={friendsData.pagedResponse}
            currentPage={friendsData.query.pageNumber || 1}
            onPageChange={(page) => friendsData.setQuery({ ...friendsData.query, pageNumber: page })}
            itemLabel="friends"
          />
        )}
      </div>
    </div>
  );
}

export default FriendsPage