import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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
import SentFriendRequestListItem from '../../../Components/Friends/SentFriendRequestListItem/SentFriendRequestListItem'
import { Link, useNavigate } from 'react-router-dom'

const SentFriendRequestsPage = () => {
  const { t } = useTranslation();
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  const SORT_OPTIONS: SortOption[] = [
    { value: 'UserName', label: t('friends.sortByUsername') },
    { value: 'CreatedAt', label: t('friends.sortByDateSent') }
  ];
  
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


  if (showLoading) {
    return <div className={styles.container}>{t('common.loading')}</div>;
  }

  
  return (
    <div className={styles.container}>
      {loadingState === 'refreshing' && (
        <div className={styles.refreshIndicator}>
          {t('friends.updating')}
        </div>
      )}

      <button onClick={() => navigate(-1)} className={styles.backButton}>
        {t('friends.goBack')}
      </button>

      <div className={styles.header}>
        <h1>{t('friends.sentRequests')}</h1>
        <div className={styles.headerRight}>
          <Link to="/friends/discover" className={styles.sendRequestButton}>
            {t('friends.send')}
          </Link>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <FilterControls
        query={query}
        onQueryChange={setQuery}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder={t('friends.searchSentPlaceholder')}
      />

      {pagedResponse && pagedResponse.items.length === 0 ? (
        <div className={styles.emptyState}>
          {t('friends.noSentRequests')}
        </div>
      ) : (
        <ul className={styles.list}>
          {pagedResponse && pagedResponse.items.map((request) => (
            <SentFriendRequestListItem
              key={request.id}
              request={request}
              profilePictureUrl={profilePictures.get(request.id)}
              onCancel={handleCancelRequest}
            />
          ))}
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