import { useEffect, useState, useCallback } from 'react'
import styles from './SearchFriendableUsersPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { searchFriendableUsersAPI } from '../../../Services/UserService'
import { sendFriendRequestAPI } from '../../../Services/FriendService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import type { UserSearchResultResponse } from '../../../Models/UserModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { usePagedData } from '../../../Helpers/usePagedData'
import FilterControls, { type SortOption } from '../../../Components/ResultFiltering/FilterControls/FilterControls'
import Pagination from '../../../Components/ResultFiltering/Pagination/Pagination'
import SearchableUserListItem from '../../../Components/Friends/SearchableUserListItem/SearchableUserListItem'
import { useNavigate } from 'react-router-dom'

const SORT_OPTIONS: SortOption[] = [
  { value: 'UserName', label: 'Username' },
];

const SearchFriendableUsersPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();
  
  const [profilePictures, setProfilePictures] = useState<Map<string, string>>(new Map());

  const fetchUsers = useCallback(
    (query: PagedQuery) => {
      // Only search if there's a search term
      if (!query.searchPhrase || query.searchPhrase.trim() === '') {
        return Promise.resolve({
          success: true as const,
          data: {
            items: [],
            totalPages: 0,
            totalItemsCount: 0,
            itemsFrom: 0,
            itemsTo: 0,
          }
        });
      }
      return searchFriendableUsersAPI(accessToken, setAccessToken, query);
    },
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
  } = usePagedData<UserSearchResultResponse>({
    fetchFunction: fetchUsers,
    defaultSortBy: 'UserName',
    onLoadingChange: setIsLoading,
  });

  useEffect(() => {
    if (pagedResponse) {
      loadProfilePictures(pagedResponse.items);
    }
  }, [pagedResponse]);

  const loadProfilePictures = async (users: UserSearchResultResponse[]) => {
    const newPictures = new Map<string, string>();
    await Promise.all(
      users.map(async (user) => {
        if (user.profilePictureUrl) {
          const pictureUrl = await fetchImageWithCache(user.profilePictureUrl, accessToken);
          if (pictureUrl) {
            newPictures.set(user.id, pictureUrl);
          }
        }
      })
    );
    setProfilePictures(newPictures);
  };

  const handleSendRequest = async (userId: string): Promise<boolean> => {
    const result = await sendFriendRequestAPI(accessToken, setAccessToken, userId);

    if (result.success) {
      return true;
    } else {
      setError(result.problem.title || 'Failed to send friend request');
      return false;
    }
  };

  if (showLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {loadingState === 'refreshing' && (
        <div className={styles.refreshIndicator}>
          Searching...
        </div>
      )}

      <button onClick={() => navigate(-1)} className={styles.backButton}>
        ← Go Back
      </button>

      <div className={styles.header}>
        <h1>Search Users</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <FilterControls
        query={query}
        onQueryChange={setQuery}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Enter username to search..."
        showSortDirection={false}
        showPageSize={false}
      />

      {!query.searchPhrase || query.searchPhrase.trim() === '' ? (
        <div className={styles.emptyState}>
          Enter a username to search for users to add as friends.
        </div>
      ) : pagedResponse && pagedResponse.items.length === 0 ? (
        <div className={styles.emptyState}>
          No users found matching "{query.searchPhrase}".
        </div>
      ) : (
        <ul className={styles.list}>
          {pagedResponse && pagedResponse.items.map((user) => (
            <SearchableUserListItem
              key={user.id}
              user={user}
              profilePictureUrl={profilePictures.get(user.id)}
              onSendRequest={handleSendRequest}
            />
          ))}
        </ul>
      )}

      {pagedResponse && pagedResponse.items.length > 0 && (
        <Pagination
          pagedResponse={pagedResponse}
          currentPage={query.pageNumber || 1}
          onPageChange={(page) => setQuery({ ...query, pageNumber: page })}
          itemLabel="users"
        />
      )}
    </div>
  );
}

export default SearchFriendableUsersPage