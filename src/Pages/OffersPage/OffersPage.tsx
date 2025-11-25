import { useEffect, useState } from 'react'
import styles from './OffersPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { useLoading } from '../../Context/useLoading'
import { getOffersAPI, getCurrentUserItemsAPI, purchaseUserItemOfferAPI } from '../../Services/ItemService'
import { getUserGameInfoAPI } from '../../Services/UserService'
import { fetchImageWithCache } from '../../Services/ApiMethodHelpers'
import { type UserItemOfferResponse, type UserItemResponse, ItemTypeDisplay } from '../../Models/ItemModels'
import type { UserGameInfoResponse } from '../../Models/UserModels'
import type { PagedQuery } from '../../Models/PagedQuery'
import { defaultPagedQuery } from '../../Models/PagedQuery'
import { SortDirection } from '../../Constants/SortDirection'
import type { PagedResponse } from '../../Models/PagedResponse'
import CreateOfferComponent from '../../Components/Offers/CreateOfferComponent/CreateOfferComponent'

const OffersPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();

  const [offers, setOffers] = useState<UserItemOfferResponse[]>([]);
  const [pagedResponse, setPagedResponse] = useState<PagedResponse<UserItemOfferResponse> | null>(null);
  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);
  const [userItems, setUserItems] = useState<UserItemResponse[]>([]);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  
  const [query, setQuery] = useState<PagedQuery>({ ...defaultPagedQuery });
  const [searchInput, setSearchInput] = useState('');
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;
    
    const fetchData = async () => {
      if (initialLoading) {
        setInitialLoading(true);
        setIsLoading(true);
        // Only show loading indicator if request takes longer than 200ms
        loadingTimer = setTimeout(() => setShowLoading(true), 200);
      } else {
        setIsRefreshing(true);
      }
      setError('');

      const [offersResult, userInfoResult, userItemsResult] = await Promise.all([
        getOffersAPI(accessToken, (newToken) => {
          setAccessToken(newToken);
        }, query, true),
        getUserGameInfoAPI(accessToken, (newToken) => {
          setAccessToken(newToken);
        }),
        getCurrentUserItemsAPI(accessToken, (newToken) => {
          setAccessToken(newToken);
        })
      ]);

      if (offersResult.success) {
        setPagedResponse(offersResult.data);
        setOffers(offersResult.data.items);
        
        // Load thumbnails for all offers
        const newThumbnails = new Map<string, string>();
        await Promise.all(
          offersResult.data.items.map(async (offer) => {
            const thumbnailUrl = await fetchImageWithCache(offer.userItem.item.thumbnailUrl, accessToken);
            if (thumbnailUrl) {
              newThumbnails.set(offer.id, thumbnailUrl);
            }
          })
        );
        setThumbnails(newThumbnails);
      } else {
        setError(offersResult.problem.title || 'Failed to load offers');
      }

      if (userInfoResult.success) {
        setUserInfo(userInfoResult.data);
      }

      if (userItemsResult.success) {
        setUserItems(userItemsResult.data.filter(item => !item.hasActiveOffer));
      }

      if (initialLoading && loadingTimer) {
        clearTimeout(loadingTimer);
        setShowLoading(false);
      }
      setInitialLoading(false);
      setIsRefreshing(false);
      setIsLoading(false);
    }

    fetchData();
  }, [accessToken, setAccessToken, query]);

  const handleBuy = async (offerId: string) => {
    const result = await purchaseUserItemOfferAPI(accessToken, setAccessToken, offerId);

    if (result.success) {
      // Refresh data after successful purchase
      const [offersResult, userInfoResult, userItemsResult] = await Promise.all([
        getOffersAPI(accessToken, setAccessToken, query, true),
        getUserGameInfoAPI(accessToken, setAccessToken),
        getCurrentUserItemsAPI(accessToken, setAccessToken)
      ]);

      if (offersResult.success) {
        setPagedResponse(offersResult.data);
        setOffers(offersResult.data.items);
      }
      if (userInfoResult.success) {
        setUserInfo(userInfoResult.data);
      }
      if (userItemsResult.success) {
        setUserItems(userItemsResult.data.filter(item => !item.hasActiveOffer));
      }
    } else {
      setError(result.problem.title || 'Failed to purchase offer');
    }
  };

  const handleCreateOfferSuccess = async () => {
    setIsCreating(false);
    
    // Refetch all data
    const [offersResult, userItemsResult] = await Promise.all([
      getOffersAPI(accessToken, setAccessToken, query, true),
      getCurrentUserItemsAPI(accessToken, setAccessToken)
    ]);

    if (offersResult.success) {
      setPagedResponse(offersResult.data);
      setOffers(offersResult.data.items);
    }
    if (userItemsResult.success) {
      setUserItems(userItemsResult.data.filter(item => !item.hasActiveOffer));
    }
  };

  const handleCreateOfferCancel = () => {
    setIsCreating(false);
    setError('');
  };

  if (showLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {isRefreshing && (
        <div className={styles.refreshIndicator}>
          Updating...
        </div>
      )}
      <div className={styles.header}>
        <h1>Active Offers</h1>
        <div className={styles.headerRight}>
          {!isCreating && (
            <button className={styles.createButton} onClick={() => setIsCreating(true)}>
              Create Offer
            </button>
          )}
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

      {isCreating && (
        <CreateOfferComponent
          userItems={userItems}
          onSuccess={handleCreateOfferSuccess}
          onCancel={handleCreateOfferCancel}
        />
      )}
      
      {offers.length === 0 ? (
        <p>No active offers available.</p>
      ) : (
        <ul className={styles.offersList}>
          {offers.map((offer) => {
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