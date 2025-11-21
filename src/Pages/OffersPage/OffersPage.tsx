import { useEffect, useState } from 'react'
import styles from './OffersPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { getOffersAPI, getCurrentUserItemsAPI, createUserItemOfferAPI, purchaseUserItemOfferAPI } from '../../Services/ItemService'
import { getUserGameInfoAPI } from '../../Services/UserService'
import { fetchImageWithCache } from '../../Services/ApiMethodHelpers'
import { type ActiveUserItemOfferResponse, type UserItemSimplifiedResponse, ItemTypeDisplay } from '../../Models/ItemModels'
import type { UserGameInfoResponse } from '../../Models/UserModels'
import type { PagedQuery } from '../../Models/PagedQuery'
import { defaultPagedQuery } from '../../Models/PagedQuery'
import { SortDirection } from '../../Constants/SortDirection'
import type { PagedResponse } from '../../Models/PagedResponse'

const OffersPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const [offers, setOffers] = useState<ActiveUserItemOfferResponse[]>([]);
  const [pagedResponse, setPagedResponse] = useState<PagedResponse<ActiveUserItemOfferResponse> | null>(null);
  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);
  const [userItems, setUserItems] = useState<UserItemSimplifiedResponse[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  
  // Pagination state
  const [query, setQuery] = useState<PagedQuery>({ ...defaultPagedQuery });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError('');

      const [offersResult, userInfoResult, userItemsResult] = await Promise.all([
        getOffersAPI(accessToken, (newToken) => {
          setAccessToken(newToken);
        }, query),
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

      setInitialLoading(false);
      setIsRefreshing(false);
    }

    fetchData();
  }, [accessToken, setAccessToken, query]);

  const handleBuy = async (offerId: string) => {
    const result = await purchaseUserItemOfferAPI(accessToken, setAccessToken, offerId);

    if (result.success) {
      // Refresh data after successful purchase
      const [offersResult, userInfoResult, userItemsResult] = await Promise.all([
        getOffersAPI(accessToken, setAccessToken, query),
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

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !offerPrice) return;

    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    const result = await createUserItemOfferAPI(
      accessToken,
      setAccessToken,
      { userItemId: selectedItemId, price }
    );

    if (result.success) {
      // Refresh data
      setIsCreating(false);
      setSelectedItemId('');
      setOfferPrice('');
      
      // Refetch all data
      const [offersResult, userItemsResult] = await Promise.all([
        getOffersAPI(accessToken, setAccessToken, query),
        getCurrentUserItemsAPI(accessToken, setAccessToken)
      ]);

      if (offersResult.success) {
        setPagedResponse(offersResult.data);
        setOffers(offersResult.data.items);
      }
      if (userItemsResult.success) {
        setUserItems(userItemsResult.data.filter(item => !item.hasActiveOffer));
      }
    } else {
      setError(result.problem.title || 'Failed to create offer');
    }
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setSelectedItemId('');
    setOfferPrice('');
    setError('');
  };

  if (initialLoading) {
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
          {userInfo && (
            <div className={styles.balanceDisplay}>
              <span className={styles.balanceLabel}>Your Balance:</span>
              <span className={styles.balanceValue}>{userInfo.balance} Gems</span>
            </div>
          )}
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
              <option value="">None</option>
              <option value="Name">Name</option>
              <option value="Type">Type</option>
              <option value="UserName">Seller</option>
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
        <form className={styles.createForm} onSubmit={handleCreateOffer}>
          <h2>Create New Offer</h2>
          <div className={styles.formGroup}>
            <label htmlFor="itemSelect">Select Item:</label>
            <select
              id="itemSelect"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">-- Choose an item --</option>
              {userItems.map((userItem) => (
                <option key={userItem.id} value={userItem.id}>
                  {userItem.item.name} ({ItemTypeDisplay[userItem.item.type]})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="priceInput">Price (Gems):</label>
            <input
              id="priceInput"
              type="number"
              min="0"
              step="1"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className={styles.input}
              placeholder="Enter price"
              required
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.publishButton}>Publish Offer</button>
            <button type="button" onClick={cancelCreate} className={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      )}
      
      {offers.length === 0 ? (
        <p>No active offers available.</p>
      ) : (
        <ul className={styles.offersList}>
          {offers.map((offer) => {
            const isOwnOffer = userInfo?.id === offer.userItem.userId;
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
                  <p className={styles.seller}>Seller: {offer.userItem.userName}</p>
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