import { useEffect, useState, useCallback } from 'react'
import styles from './SentFriendRequestsPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getSentFriendRequestsAPI, cancelFriendRequestAPI } from '../../../Services/FriendService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import type { FriendRequestResponse } from '../../../Models/FriendModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { usePagedData } from '../../../Helpers/usePagedData'
import FilterControls, { type SortOption } from '../../../Components/ResultFiltering/FilterControls/FilterControls'
import Pagination from '../../../Components/ResultFiltering/Pagination/Pagination'

const SORT_OPTIONS: SortOption[] = [
  { value: 'UserName', label: 'Recipient' },
  { value: 'CreatedAt', label: 'Date Sent' }
];

const SentFriendRequestsPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  
  const [profilePictures, setProfilePictures] = useState<Map<string, string>>(new Map());

  const fetchSentRequests = useCallback(
    (query: PagedQuery) => getSentFriendRequestsAPI(accessToken, setAccessToken, query),
    [accessToken, setAccessToken]
  );

  const {
    pagedResponse,
    query,
    setQuery,
    loadingState,
    showLoading,
    error,
    setError,
  } = usePagedData<FriendRequestResponse>({
    fetchFunction: fetchSentRequests,
    defaultSortBy: 'UserName',
    onLoadingChange: setIsLoading,
  });

  
  useEffect(() => {
    if (pagedResponse) {
      loadProfilePictures(pagedResponse.items);
    }
  }, [pagedResponse]);

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

  const handleCancelRequest = async (requestId: string) => {
    const result = await cancelFriendRequestAPI(accessToken, setAccessToken, requestId);

    if (result.success) {
      // Refresh the requests list
      setQuery({ ...query });
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

      <FilterControls
        query={query}
        onQueryChange={setQuery}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search sent requests..."
      />

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

      {pagedResponse && (
        <Pagination
          pagedResponse={pagedResponse}
          currentPage={query.pageNumber || 1}
          onPageChange={(page) => setQuery({ ...query, pageNumber: page })}
          itemLabel="requests"
        />
      )}
    </div>
  );
}

export default SentFriendRequestsPage