import { useEffect, useState } from 'react'
import styles from './FriendsPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getReceivedFriendRequestsAPI, getFriendsAPI } from '../../../Services/FriendService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import type { FriendRequestResponse, FriendResponse } from '../../../Models/FriendModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { defaultPagedQuery } from '../../../Models/PagedQuery'
import { SortDirection } from '../../../Constants/SortDirection'
import type { PagedResponse } from '../../../Models/PagedResponse'
import { Link } from 'react-router-dom'

const FriendsPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  
  // Friend Requests State
  const [requestsPagedResponse, setRequestsPagedResponse] = useState<PagedResponse<FriendRequestResponse> | null>(null);
  const [requestsQuery, setRequestsQuery] = useState<PagedQuery>({ ...defaultPagedQuery, sortBy: 'UserName' });
  const [requestsSearchInput, setRequestsSearchInput] = useState('');
  const [requestProfilePictures, setRequestProfilePictures] = useState<Map<string, string>>(new Map());
  
  // Friends State
  const [friendsPagedResponse, setFriendsPagedResponse] = useState<PagedResponse<FriendResponse> | null>(null);
  const [friendsQuery, setFriendsQuery] = useState<PagedQuery>({ ...defaultPagedQuery, sortBy: 'UserName' });
  const [friendsSearchInput, setFriendsSearchInput] = useState('');
  const [friendProfilePictures, setFriendProfilePictures] = useState<Map<string, string>>(new Map());
  
  // Loading and Error State
  const [loadingState, setLoadingState] = useState<'initial' | 'loaded' | 'refreshing'>('initial');
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    fetchRequests();
  }, [requestsQuery]);

  useEffect(() => {
    fetchFriends();
  }, [friendsQuery]);


  const fetchRequests = async () => {
    setError('');
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;
    const isInitialLoad = loadingState === 'initial';
      
    if (isInitialLoad) {
      setIsLoading(true);
      loadingTimer = setTimeout(() => setShowLoading(true), 200);
    } else {
      setLoadingState('refreshing');
    }

    const result = await getReceivedFriendRequestsAPI(
      accessToken, 
      (newToken) => setAccessToken(newToken), 
      requestsQuery
    );

    if (result.success) {
      setRequestsPagedResponse(result.data);
      await loadRequestProfilePictures(result.data.items);
    } else {
      setError(result.problem.title || 'Failed to load friend requests');
    }

    if (loadingTimer) clearTimeout(loadingTimer);
    finishLoading();
  };


  const fetchFriends = async () => {
    setError('');
    
    const result = await getFriendsAPI(
      accessToken, 
      (newToken) => setAccessToken(newToken), 
      friendsQuery
    );

    if (result.success) {
      setFriendsPagedResponse(result.data);
      await loadFriendProfilePictures(result.data.items);
    } else {
      setError(result.problem.title || 'Failed to load friends');
    }
  };


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


  const finishLoading = () => {
    setIsLoading(false);
    setLoadingState('loaded');
    setShowLoading(false);
  };


  const handleAcceptRequest = async (requestId: string) => {
    // TODO: Implement accept request API call
    console.log('Accept request:', requestId);
  };


  const handleDeclineRequest = async (requestId: string) => {
    // TODO: Implement decline request API call
    console.log('Decline request:', requestId);
  };


  if (showLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  
  return (
    <div className={styles.container}>
      {loadingState === 'refreshing' && (
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

      {error && <div className={styles.error}>{error}</div>}

      {/* Friend Requests Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>Friend Requests</h2>

        <div className={styles.filtersSection}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              placeholder="Search friend requests..."
              value={requestsSearchInput}
              onChange={(e) => setRequestsSearchInput(e.target.value)}
              className={styles.searchInput}
            />
            <button
              onClick={() => setRequestsQuery({ ...requestsQuery, searchPhrase: requestsSearchInput, pageNumber: 1 })}
              className={styles.searchButton}
            >
              Search
            </button>
          </div>

          <div className={styles.filterControls}>
            <div className={styles.filterGroup}>
              <label>Sort By:</label>
              <select
                value={requestsQuery.sortBy || ''}
                onChange={(e) => setRequestsQuery({ ...requestsQuery, sortBy: e.target.value || null, pageNumber: 1 })}
                className={styles.select}
              >
                <option value="UserName">Username</option>
                <option value="CreatedAt">Date Received</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Direction:</label>
              <select
                value={requestsQuery.sortDirection || SortDirection.Ascending}
                onChange={(e) => setRequestsQuery({ ...requestsQuery, sortDirection: e.target.value as SortDirection })}
                className={styles.select}
              >
                <option value={SortDirection.Ascending}>Ascending</option>
                <option value={SortDirection.Descending}>Descending</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Per Page:</label>
              <select
                value={requestsQuery.pageSize || 10}
                onChange={(e) => setRequestsQuery({ ...requestsQuery, pageSize: parseInt(e.target.value), pageNumber: 1 })}
                className={styles.select}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
          </div>
        </div>

        {requestsPagedResponse && requestsPagedResponse.items.length === 0 ? (
          <div className={styles.emptyState}>No pending friend requests.</div>
        ) : (
          <ul className={styles.list}>
            {requestsPagedResponse && requestsPagedResponse.items.map((request) => (
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

        {requestsPagedResponse && requestsPagedResponse.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setRequestsQuery({ ...requestsQuery, pageNumber: (requestsQuery.pageNumber || 1) - 1 })}
              disabled={(requestsQuery.pageNumber || 1) <= 1}
              className={styles.pageButton}
            >
              Previous
            </button>
            
            <span className={styles.pageInfo}>
              Page {requestsQuery.pageNumber || 1} of {requestsPagedResponse.totalPages}
              {' '}({requestsPagedResponse.itemsFrom}-{requestsPagedResponse.itemsTo} of {requestsPagedResponse.totalItemsCount} requests)
            </span>
            
            <button
              onClick={() => setRequestsQuery({ ...requestsQuery, pageNumber: (requestsQuery.pageNumber || 1) + 1 })}
              disabled={(requestsQuery.pageNumber || 1) >= requestsPagedResponse.totalPages}
              className={styles.pageButton}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Friends Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>My Friends</h2>

        <div className={styles.filtersSection}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              placeholder="Search friends..."
              value={friendsSearchInput}
              onChange={(e) => setFriendsSearchInput(e.target.value)}
              className={styles.searchInput}
            />
            <button
              onClick={() => setFriendsQuery({ ...friendsQuery, searchPhrase: friendsSearchInput, pageNumber: 1 })}
              className={styles.searchButton}
            >
              Search
            </button>
          </div>

          <div className={styles.filterControls}>
            <div className={styles.filterGroup}>
              <label>Sort By:</label>
              <select
                value={friendsQuery.sortBy || ''}
                onChange={(e) => setFriendsQuery({ ...friendsQuery, sortBy: e.target.value || null, pageNumber: 1 })}
                className={styles.select}
              >
                <option value="UserName">Username</option>
                <option value="FriendsSince">Friends Since</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Direction:</label>
              <select
                value={friendsQuery.sortDirection || SortDirection.Ascending}
                onChange={(e) => setFriendsQuery({ ...friendsQuery, sortDirection: e.target.value as SortDirection })}
                className={styles.select}
              >
                <option value={SortDirection.Ascending}>Ascending</option>
                <option value={SortDirection.Descending}>Descending</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Per Page:</label>
              <select
                value={friendsQuery.pageSize || 10}
                onChange={(e) => setFriendsQuery({ ...friendsQuery, pageSize: parseInt(e.target.value), pageNumber: 1 })}
                className={styles.select}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
          </div>
        </div>

        {friendsPagedResponse && friendsPagedResponse.items.length === 0 ? (
          <div className={styles.emptyState}>No friends yet. Start by accepting friend requests!</div>
        ) : (
          <ul className={styles.list}>
            {friendsPagedResponse && friendsPagedResponse.items.map((friend) => (
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

        {friendsPagedResponse && friendsPagedResponse.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setFriendsQuery({ ...friendsQuery, pageNumber: (friendsQuery.pageNumber || 1) - 1 })}
              disabled={(friendsQuery.pageNumber || 1) <= 1}
              className={styles.pageButton}
            >
              Previous
            </button>
            
            <span className={styles.pageInfo}>
              Page {friendsQuery.pageNumber || 1} of {friendsPagedResponse.totalPages}
              {' '}({friendsPagedResponse.itemsFrom}-{friendsPagedResponse.itemsTo} of {friendsPagedResponse.totalItemsCount} friends)
            </span>
            
            <button
              onClick={() => setFriendsQuery({ ...friendsQuery, pageNumber: (friendsQuery.pageNumber || 1) + 1 })}
              disabled={(friendsQuery.pageNumber || 1) >= friendsPagedResponse.totalPages}
              className={styles.pageButton}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendsPage