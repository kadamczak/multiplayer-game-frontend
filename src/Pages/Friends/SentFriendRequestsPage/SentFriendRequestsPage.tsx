import { useEffect, useState } from 'react'
import styles from './SentFriendRequestsPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getSentFriendRequestsAPI, cancelFriendRequestAPI } from '../../../Services/FriendService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import type { FriendRequestResponse } from '../../../Models/FriendModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { defaultPagedQuery } from '../../../Models/PagedQuery'
import { SortDirection } from '../../../Constants/SortDirection'
import type { PagedResponse } from '../../../Models/PagedResponse'

const SentFriendRequestsPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  
  const [pagedResponse, setPagedResponse] = useState<PagedResponse<FriendRequestResponse> | null>(null);
  const [query, setQuery] = useState<PagedQuery>({ ...defaultPagedQuery, sortBy: 'UserName' });
  const [searchInput, setSearchInput] = useState('');
  const [profilePictures, setProfilePictures] = useState<Map<string, string>>(new Map());
  
  const [loadingState, setLoadingState] = useState<'initial' | 'loaded' | 'refreshing'>('initial');
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    fetchRequests();
  }, [query]);


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

    const result = await getSentFriendRequestsAPI(
      accessToken, 
      (newToken) => setAccessToken(newToken), 
      query
    );

    if (result.success) {
      setPagedResponse(result.data);
      await loadProfilePictures(result.data.items);
    } else {
      setError(result.problem.title || 'Failed to load sent friend requests');
    }

    if (loadingTimer) clearTimeout(loadingTimer);
    finishLoading();
  };


  const loadProfilePictures = async (requests: FriendRequestResponse[]) => {
    const newPictures = new Map<string, string>();
    await Promise.all(
      requests.map(async (request) => {
        if (request.receiverProfilePictureUrl) {
          const pictureUrl = await fetchImageWithCache(request.receiverProfilePictureUrl, accessToken);
          if (pictureUrl) {
            newPictures.set(request.id, pictureUrl);
          }
        }
      })
    );
    setProfilePictures(newPictures);
  };


  const finishLoading = () => {
    setIsLoading(false);
    setLoadingState('loaded');
    setShowLoading(false);
  };


  const handleCancelRequest = async (requestId: string) => {
    const result = await cancelFriendRequestAPI(accessToken, setAccessToken, requestId);

    if (result.success) {
      await fetchRequests();
    } else {
      setError(result.problem.title || 'Failed to cancel friend request');
    }
  };


  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return styles.statusPending;
      case 'accepted':
        return styles.statusAccepted;
      case 'rejected':
      case 'declined':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
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
        <h1>Sent Friend Requests</h1>
        <div className={styles.headerRight}>
          <button className={styles.sendRequestButton}>
            Send Friend Request
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Search sent requests..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
          />
          <button
            onClick={() => setQuery({ ...query, searchPhrase: searchInput, pageNumber: 1 })}
            className={styles.searchButton}
          >
            Search
          </button>
        </div>

        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label>Sort By:</label>
            <select
              value={query.sortBy || ''}
              onChange={(e) => setQuery({ ...query, sortBy: e.target.value || null, pageNumber: 1 })}
              className={styles.select}
            >
              <option value="ReceiverUserName">Recipient</option>
              <option value="CreatedAt">Date Sent</option>
              <option value="Status">Status</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Direction:</label>
            <select
              value={query.sortDirection || SortDirection.Ascending}
              onChange={(e) => setQuery({ ...query, sortDirection: e.target.value as SortDirection })}
              className={styles.select}
            >
              <option value={SortDirection.Ascending}>Ascending</option>
              <option value={SortDirection.Descending}>Descending</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Per Page:</label>
            <select
              value={query.pageSize || 10}
              onChange={(e) => setQuery({ ...query, pageSize: parseInt(e.target.value), pageNumber: 1 })}
              className={styles.select}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        </div>
      </div>

      {pagedResponse && pagedResponse.items.length === 0 ? (
        <div className={styles.emptyState}>
          No sent friend requests. Send a request to connect with other players!
        </div>
      ) : (
        <ul className={styles.list}>
          {pagedResponse && pagedResponse.items.map((request) => {
            const isPending = request.status.toLowerCase() === 'pending';
            
            return (
              <li key={request.id}>
                {profilePictures.get(request.id) ? (
                  <img 
                    src={profilePictures.get(request.id)} 
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
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className={styles.requestActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => handleCancelRequest(request.id)}
                    disabled={!isPending}
                  >
                    {isPending ? 'Cancel' : 'Remove'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pagedResponse && pagedResponse.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setQuery({ ...query, pageNumber: (query.pageNumber || 1) - 1 })}
            disabled={(query.pageNumber || 1) <= 1}
            className={styles.pageButton}
          >
            Previous
          </button>
          
          <span className={styles.pageInfo}>
            Page {query.pageNumber || 1} of {pagedResponse.totalPages}
            {' '}({pagedResponse.itemsFrom}-{pagedResponse.itemsTo} of {pagedResponse.totalItemsCount} requests)
          </span>
          
          <button
            onClick={() => setQuery({ ...query, pageNumber: (query.pageNumber || 1) + 1 })}
            disabled={(query.pageNumber || 1) >= pagedResponse.totalPages}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default SentFriendRequestsPage