import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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

const UserItemsPage = () => {
  const { t } = useTranslation();
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();

  const SORT_OPTIONS: SortOption[] = [
    { value: 'Name', label: t('items.sortByName') },
    { value: 'Type', label: t('items.sortByType') },
    { value: 'Description', label: t('items.sortByDescription') },
  ];

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
      setItemBeingSoldState({ ...itemBeingSoldState, error: t('items.enterValidPrice') });
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
      setItemBeingSoldState({ ...itemBeingSoldState, error: result.problem.title || t('items.failedToCreateOffer') });
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
      setError(result.problem.title || t('items.failedToCancelOffer'));
    }
  };


  if (showLoading) {
    return <div className={styles.container}>{t('common.loading')}</div>;
  }


  return (
    <div className={styles.container}>
      {loadingState === 'refreshing' && (
        <div className={styles.refreshIndicator}>
          {t('items.updating')}
        </div>
      )}
      
      <h1>{t('items.myItems')}</h1>

      {error && <div className={styles.error}>{error}</div>}

      <FilterControls
        query={query}
        onQueryChange={setQuery}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder={t('items.searchItems')}
      />
      
      {pagedResponse && pagedResponse.items.length === 0 ? (
        <p>{t('items.noItemsFound')}</p>
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
        />
      )}
    </div>
  )
}

export default UserItemsPage;