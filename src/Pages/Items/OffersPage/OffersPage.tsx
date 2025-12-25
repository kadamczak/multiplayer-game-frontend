import { useEffect, useState, useCallback } from 'react'
import styles from './OffersPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getOffersAPI, purchaseUserItemOfferAPI } from '../../../Services/ItemService'
import { getUserGameInfoAPI } from '../../../Services/UserService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import { type UserItemOfferResponse, ItemTypeDisplay } from '../../../Models/ItemModels'
import type { UserGameInfoResponse } from '../../../Models/UserModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { usePagedData } from '../../../Helpers/usePagedData'
import FilterControls, { type SortOption } from '../../../Components/ResultFiltering/FilterControls/FilterControls'
import Pagination from '../../../Components/ResultFiltering/Pagination/Pagination'

const SORT_OPTIONS: SortOption[] = [
  { value: 'Name', label: 'Name' },
  { value: 'Type', label: 'Type' },
  { value: 'SellerUserName', label: 'Seller' },
  { value: 'Price', label: 'Price' },
];

const OffersPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  
  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());

  const fetchOffers = useCallback(
    (query: PagedQuery) => getOffersAPI(accessToken, setAccessToken, query, true),
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
  } = usePagedData<UserItemOfferResponse>({
    fetchFunction: fetchOffers,
    defaultSortBy: 'Name',
    onLoadingChange: setIsLoading,
  });

  
  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (pagedResponse) {
      loadThumbnails(pagedResponse.items);
    }
  }, [pagedResponse]);

  const fetchUserInfo = async () => {
    const result = await getUserGameInfoAPI(accessToken, setAccessToken);
    result.success && setUserInfo(result.data);
  };

  const loadThumbnails = async (offers: UserItemOfferResponse[]) => {
    const newThumbnails = new Map<string, string>();
    await Promise.all(
      offers.map(async (offer) => {
        const thumbnailUrl = await fetchImageWithCache(offer.userItem.item.thumbnailUrl, accessToken);
        if (thumbnailUrl) {
          newThumbnails.set(offer.id, thumbnailUrl);
        }
      })
    );
    setThumbnails(newThumbnails);
  };

  const handleBuy = async (offerId: string) => {
    const result = await purchaseUserItemOfferAPI(accessToken, setAccessToken, offerId);

    if (result.success) {
      const userInfoResult = await getUserGameInfoAPI(accessToken, setAccessToken);
      userInfoResult.success && setUserInfo(userInfoResult.data);
      // Refresh the offers list
      // The usePagedData hook will automatically refetch when query changes
      setQuery({ ...query });
    } else {
      setError(result.problem.title || 'Failed to purchase offer');
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
        <h1>Active Offers</h1>
        <div className={styles.headerRight}>

          <div className={styles.balanceDisplay}>
            <span className={styles.balanceLabel}>Your Balance:</span>
            <span className={styles.balanceValue}>
              {userInfo ? `${userInfo.balance} Gems` : 'Gems'}
            </span>
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <FilterControls
        query={query}
        onQueryChange={setQuery}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search offers..."
      />
  
      {pagedResponse && pagedResponse.items.length === 0 ? (
        <p>No active offers available.</p>
      ) : (
        <ul className={styles.offersList}>
          {pagedResponse && pagedResponse.items.map((offer) => {
            const isOwnOffer = userInfo?.id === offer.sellerId;
            const canAfford = userInfo ? userInfo.balance >= offer.price : false;

            return (
              <li key={offer.id}>
                <div className={styles.thumbnailContainer}>
                  {thumbnails.get(offer.id) ? (
                    <img 
                      src={thumbnails.get(offer.id)} 
                      alt={offer.userItem.item.name}
                      className={styles.thumbnail}
                    />
                  ) : (
                    <div className={styles.thumbnailPlaceholder} />
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <strong>{offer.userItem.item.name}</strong>
                  <p>{ItemTypeDisplay[offer.userItem.item.type]}</p>
                  <p>{offer.userItem.item.description}</p>
                  <p className={styles.seller}>Seller: {offer.sellerUsername}</p>
                </div>
                <div className={styles.priceSection}>
                  <span className={styles.priceLabel}>Price</span>
                  <span className={styles.price}>{offer.price} Gems</span>
                  {!isOwnOffer && (
                    <button
                      className={styles.buyButton}
                      onClick={() => handleBuy(offer.id)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Buy' : 'Insufficient Funds'}
                    </button>
                  )}
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
          itemLabel="items"
        />
      )}
    </div>
  );
}

export default OffersPage