import { useEffect, useState } from 'react'
import styles from './OffersPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getOffersAPI, purchaseUserItemOfferAPI } from '../../../Services/ItemService'
import { getUserGameInfoAPI } from '../../../Services/UserService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import { type UserItemOfferResponse, ItemTypeDisplay } from '../../../Models/ItemModels'
import type { UserGameInfoResponse } from '../../../Models/UserModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { defaultPagedQuery } from '../../../Models/PagedQuery'
import { SortDirection } from '../../../Constants/SortDirection'
import type { PagedResponse } from '../../../Models/PagedResponse'

const OffersPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  
  const [pagedResponse, setPagedResponse] = useState<PagedResponse<UserItemOfferResponse> | null>(null);
  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  
  const [query, setQuery] = useState<PagedQuery>({ ...defaultPagedQuery });
  const [searchInput, setSearchInput] = useState('');
  
  const [loadingState, setLoadingState] = useState<'initial' | 'loaded' | 'refreshing'>('initial');
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    fetchData();
  }, [query]);


  const fetchData = async () => {
    setError('');
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;
    const isInitialLoad = loadingState === 'initial';
      
    if (isInitialLoad) {
      setIsLoading(true);
      loadingTimer = setTimeout(() => setShowLoading(true), 200);
      query.sortBy = "Name";
    } else {
      setLoadingState('refreshing');
    }

    const [offersResult, userInfoResult] = await fetchOffersAndUserInfo(query);

    if (offersResult.success) {
      setPagedResponse(offersResult.data);
      await loadThumbnails(offersResult.data.items);
    } else {
      setError(offersResult.problem.title || 'Failed to load offers');
    }

    userInfoResult.success && setUserInfo(userInfoResult.data);
    loadingTimer && clearTimeout(loadingTimer);
    finishLoading();
  };


  const fetchOffersAndUserInfo = async (query: PagedQuery) => await Promise.all([
    getOffersAPI(accessToken, (newToken) => {
      setAccessToken(newToken)
    }, query, true),

    getUserGameInfoAPI(accessToken, (newToken) => {
      setAccessToken(newToken)
    })
  ]);


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


  const finishLoading = async() => {
    setIsLoading(false);
    setLoadingState('loaded');
    setShowLoading(false);
  }


  const handleBuy = async (offerId: string) => {
    const result = await purchaseUserItemOfferAPI(accessToken, setAccessToken, offerId);

    if (result.success) {
      const [offersResult, userInfoResult] = await fetchOffersAndUserInfo(query);
      offersResult.success && setPagedResponse(offersResult.data);
      userInfoResult.success && setUserInfo(userInfoResult.data);
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

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Search offers..."
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
              <option value="Name">Name</option>
              <option value="Type">Type</option>
              <option value="SellerUserName">Seller</option>
              <option value="Price">Price</option>
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
            {' '}({pagedResponse.itemsFrom}-{pagedResponse.itemsTo} of {pagedResponse.totalItemsCount} items)
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

export default OffersPage