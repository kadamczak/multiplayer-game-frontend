import { useEffect, useState, useCallback } from 'react'
import styles from './UserItemsPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getCurrentUserItemsAPI, createUserItemOfferAPI, deleteUserItemOfferAPI } from '../../../Services/ItemService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import { type UserItemResponse } from '../../../Models/ItemModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { usePagedData } from '../../../Helpers/usePagedData'
import FilterControls, { type SortOption } from '../../../Components/ResultFiltering/FilterControls/FilterControls'
import Pagination from '../../../Components/ResultFiltering/Pagination/Pagination'
import UserItemListItem from '../../../Components/UserItems/UserItemListItem/UserItemListItem'

const SORT_OPTIONS: SortOption[] = [
  { value: 'Name', label: 'Name' },
  { value: 'Type', label: 'Type' },
  { value: 'Description', label: 'Description' },
];

const UserItemsPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();

  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  const [itemBeingSoldState, setItemBeingSoldState] = useState<{
    itemId: string | null;
    price: string;
    error: string;
  }>({ itemId: null, price: '', error: '' });

  const fetchUserItems = useCallback(
    (query: PagedQuery) => getCurrentUserItemsAPI(accessToken, setAccessToken, query),
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
  } = usePagedData<UserItemResponse>({
    fetchFunction: fetchUserItems,
    defaultSortBy: 'Name',
    onLoadingChange: setIsLoading,
  });


  useEffect(() => {
    if (pagedResponse) {
      loadThumbnails(pagedResponse.items);
    }
  }, [pagedResponse]);

  const loadThumbnails = async (userItems: UserItemResponse[]) => {
    const newThumbnails = new Map<string, string>();
    await Promise.all(
      userItems.map(async (userItem) => {
        const thumbnailUrl = await fetchImageWithCache(userItem.item.thumbnailUrl, accessToken);
        if (thumbnailUrl) {
          newThumbnails.set(userItem.id, thumbnailUrl);
        }
      })
    );
    setThumbnails(newThumbnails);
  };


  const handleSellClick = (itemId: string) => {
    setItemBeingSoldState({ itemId, price: '', error: '' });
  };


  const handleCancelSell = () => {
    resetItemBeingSold();
  };


  const handleAcceptSell = async (userItemId: string) => {
    const price = parseFloat(itemBeingSoldState.price);
    if (isNaN(price) || price <= 0) {
      setItemBeingSoldState({ ...itemBeingSoldState, error: 'Please enter a valid price' });
      return;
    }

    const result = await createUserItemOfferAPI(
      accessToken,
      setAccessToken,
      { userItemId, price }
    );

    if (result.success) {
      resetItemBeingSold();
      // Refresh the items list
      setQuery({ ...query });
    } else {
      setItemBeingSoldState({ ...itemBeingSoldState, error: result.problem.title || 'Failed to create offer' });
    }
  };

  const resetItemBeingSold = () => {
    setItemBeingSoldState({ itemId: null, price: '', error: '' });
  }


  const handleCancelOffer = async (offerId: string) => {
    const result = await deleteUserItemOfferAPI(accessToken, setAccessToken, offerId);

    if (result.success) {
      // Refresh the items list
      setQuery({ ...query });
    } else {
      setError(result.problem.title || 'Failed to cancel offer');
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
      
      <h1>My Items</h1>

      {error && <div className={styles.error}>{error}</div>}

      <FilterControls
        query={query}
        onQueryChange={setQuery}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search items..."
      />
      
      {pagedResponse && pagedResponse.items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul>
          {pagedResponse && pagedResponse.items.map((userItem) => (
            <UserItemListItem
              key={userItem.id}
              userItem={userItem}
              thumbnailUrl={thumbnails.get(userItem.id)}
              isBeingSold={itemBeingSoldState.itemId === userItem.id}
              sellPrice={itemBeingSoldState.price}
              sellError={itemBeingSoldState.error}
              onSellClick={handleSellClick}
              onCancelSell={handleCancelSell}
              onAcceptSell={handleAcceptSell}
              onCancelOffer={handleCancelOffer}
              onPriceChange={(price) => setItemBeingSoldState({ ...itemBeingSoldState, price })}
            />
          ))}
        </ul>
      )}

      {pagedResponse && (
        <Pagination
          pagedResponse={pagedResponse}
          currentPage={query.pageNumber || 1}
          onPageChange={(page) => setQuery({ ...query, pageNumber: page })}
          itemLabel="items"
        />
      )}
    </div>
  )
}

export default UserItemsPage;