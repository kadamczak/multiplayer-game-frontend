import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './FriendsPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getReceivedFriendRequestsAPI, getFriendsAPI, acceptFriendRequestAPI, rejectFriendRequestAPI, removeFriendAPI } from '../../../Services/FriendService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import type { FriendRequestResponse, FriendResponse } from '../../../Models/FriendModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { usePagedData } from '../../../Helpers/usePagedData'
import FilterControls, { type SortOption } from '../../../Components/ResultFiltering/FilterControls/FilterControls'
import Pagination from '../../../Components/ResultFiltering/Pagination/Pagination'
import ReceivedFriendRequestListItem from '../../../Components/Friends/ReceivedFriendRequestListItem/ReceivedFriendRequestListItem'
import FriendListItem from '../../../Components/Friends/FriendListItem/FriendListItem'
import { Link } from 'react-router-dom'

const FriendsPage = () => {
  const { t } = useTranslation();
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();

  const REQUESTS_SORT_OPTIONS: SortOption[] = [
    { value: 'UserName', label: t('friends.sortByUsername') },
    { value: 'CreatedAt', label: t('friends.sortByDate') },
  ];

  const FRIENDS_SORT_OPTIONS: SortOption[] = [
    { value: 'UserName', label: t('friends.sortByUsername') },
    { value: 'RespondedAt', label: t('friends.sortByFriendsSince') },
  ];
  
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
    const result = await acceptFriendRequestAPI(accessToken, setAccessToken, requestId);

    if (result.success) {
      // Refresh both lists - the request will be removed and the friend will be added
      requestsData.setQuery({ ...requestsData.query });
      friendsData.setQuery({ ...friendsData.query });
    } else {
      requestsData.setError(result.problem.title || 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const result = await rejectFriendRequestAPI(accessToken, setAccessToken, requestId);

    if (result.success) {
      // Refresh the requests list
      requestsData.setQuery({ ...requestsData.query });
    } else {
      requestsData.setError(result.problem.title || 'Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendUserId: string, friendUserName: string) => {
    const confirmed = window.confirm(`${t('common.confirmRemove')} ${friendUserName}?`);
    
    if (!confirmed) {
      return;
    }

    const result = await removeFriendAPI(accessToken, setAccessToken, friendUserId);

    if (result.success) {
      // Refresh the friends list
      friendsData.setQuery({ ...friendsData.query });
    } else {
      friendsData.setError(result.problem.title || t('common.error'));
    }
  };

  if (requestsData.showLoading || friendsData.showLoading) {
    return <div className={styles.container}>{t('common.loading')}</div>;
  }
  
  return (
    <div className={styles.container}>
      {(requestsData.loadingState === 'refreshing' || friendsData.loadingState === 'refreshing') && (
        <div className={styles.refreshIndicator}>
          {t('friends.updating')}
        </div>
      )}

      <div className={styles.header}>
        <h1>{t('friends.title')}</h1>
        <div className={styles.headerRight}>
          <Link to="/friends/requests/sent" className={styles.sentRequestsButton}>
            {t('friends.sentRequests')}
          </Link>
        </div>
      </div>

      {requestsData.error && <div className={styles.error}>{requestsData.error}</div>}
      {friendsData.error && <div className={styles.error}>{friendsData.error}</div>}

      {/* Friend Requests Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>{t('friends.requests')}</h2>

        <FilterControls
          query={requestsData.query}
          onQueryChange={requestsData.setQuery}
          sortOptions={REQUESTS_SORT_OPTIONS}
          searchPlaceholder={t('friends.searchRequestsPlaceholder')}
        />

        {requestsData.pagedResponse && requestsData.pagedResponse.items.length === 0 ? (
          <div className={styles.emptyState}>{t('friends.noRequests')}</div>
        ) : (
          <ul className={styles.list}>
            {requestsData.pagedResponse && requestsData.pagedResponse.items.map((request) => (
              <ReceivedFriendRequestListItem
                key={request.id}
                request={request}
                profilePictureUrl={requestProfilePictures.get(request.id)}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
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
        <h2 className={styles.sectionHeader}>{t('friends.myFriends')}</h2>

        <FilterControls
          query={friendsData.query}
          onQueryChange={friendsData.setQuery}
          sortOptions={FRIENDS_SORT_OPTIONS}
          searchPlaceholder={t('friends.searchFriendsPlaceholder')}
        />

        {friendsData.pagedResponse && friendsData.pagedResponse.items.length === 0 ? (
          <div className={styles.emptyState}>{t('friends.noFriends')}</div>
        ) : (
          <ul className={styles.list}>
            {friendsData.pagedResponse && friendsData.pagedResponse.items.map((friend) => (
              <FriendListItem
                key={friend.userId}
                friend={friend}
                profilePictureUrl={friendProfilePictures.get(friend.userId)}
                onRemove={handleRemoveFriend}
              />
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