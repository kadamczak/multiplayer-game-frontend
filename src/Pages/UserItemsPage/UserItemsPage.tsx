import { useEffect, useState } from 'react'
import styles from './UserItemsPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { useLoading } from '../../Context/useLoading'
import { getCurrentUserItemsAPI, createUserItemOfferAPI } from '../../Services/ItemService'
import { fetchImageWithCache } from '../../Services/ApiMethodHelpers'
import { type UserItemResponse, ItemTypeDisplay } from '../../Models/ItemModels'
import type { PagedResponse } from '../../Models/PagedResponse'
import { defaultPagedQuery, type PagedQuery } from '../../Models/PagedQuery'
import { SortDirection } from '../../Constants/SortDirection'

const UserItemsPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();

  const [items, setItems] = useState<UserItemResponse[]>([]);
  const [pagedResponse, setPagedResponse] = useState<PagedResponse<UserItemResponse> | null>(null);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());

  const [query, setQuery] = useState<PagedQuery>({ ...defaultPagedQuery, sortBy: 'Name' });
  const [searchInput, setSearchInput] = useState('');

  const [initialLoading, setInitialLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [sellingItemId, setSellingItemId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState('');
  const [sellError, setSellError] = useState('');

  useEffect(() => {
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;
    
    const fetchItems = async () => {
      if (initialLoading) {
        setInitialLoading(true);
        setIsLoading(true);
        loadingTimer = setTimeout(() => setShowLoading(true), 200);
        query.sortBy = "Name"
      } else {
        setIsRefreshing(true);
      }
      setError('');

      const result = await getCurrentUserItemsAPI(accessToken, setAccessToken, query);

      if (result.success) {
        setPagedResponse(result.data);
        setItems(result.data.items);

        const newThumbnails = new Map<string, string>();
        await Promise.all(
          result.data.items.map(async (userItem) => {
            const thumbnailUrl = await fetchImageWithCache(userItem.item.thumbnailUrl, accessToken);
            if (thumbnailUrl) {
              newThumbnails.set(userItem.id, thumbnailUrl);
            }
          })
        );
        setThumbnails(newThumbnails);
      } else {
        setError(result.problem.title || 'Failed to load items');
      }

      if (initialLoading && loadingTimer) {
        clearTimeout(loadingTimer);
        setShowLoading(false);
      }
      setInitialLoading(false);
      setIsRefreshing(false);
      setIsLoading(false);
    }

    fetchItems();
  }, [query]);

  const handleSellClick = (itemId: string) => {
    setSellingItemId(itemId);
    setSellPrice('');
    setSellError('');
  };

  const handleCancelSell = () => {
    setSellingItemId(null);
    setSellPrice('');
    setSellError('');
  };

  const handleAcceptSell = async (userItemId: string) => {
    const price = parseFloat(sellPrice);
    if (isNaN(price) || price <= 0) {
      setSellError('Please enter a valid price');
      return;
    }

    const result = await createUserItemOfferAPI(
      accessToken,
      setAccessToken,
      { userItemId, price }
    );

    if (result.success) {
      setSellingItemId(null);
      setSellPrice('');
      setSellError('');
      
      // Refresh items
      const itemsResult = await getCurrentUserItemsAPI(accessToken, setAccessToken, query);
      if (itemsResult.success) {
        setPagedResponse(itemsResult.data);
        setItems(itemsResult.data.items);
      }
    } else {
      setSellError(result.problem.title || 'Failed to create offer');
    }
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
      
      <h1>My Items</h1>

      {error && <div className={styles.error}>{error}</div>}

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Search items..."
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
              <option value="Description">Description</option>
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
      
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul>
          {items.map((userItem) => (
            <li key={userItem.id}>
              <div className={styles.thumbnailWrapper}>
                {thumbnails.get(userItem.id) && (
                  <img 
                    src={thumbnails.get(userItem.id)} 
                    alt={userItem.item.name}
                    className={styles.thumbnail}
                  />
                )}
              </div>
              <div className={styles.itemContent}>
                <strong>{userItem.item.name}</strong>
                <p>{ItemTypeDisplay[userItem.item.type]}</p>
                <p>{userItem.item.description}</p>
              </div>
              
              {userItem.activeOfferId && (
                <div className={styles.priceSection}>
                  <span className={styles.priceLabel}>Awaiting Trade</span>
                  <span className={styles.price}>{userItem.activeOfferPrice} Gems</span>
                </div>
              )}

              {!userItem.activeOfferId && sellingItemId !== userItem.id && (
                <div className={styles.priceSection}>
                  <button 
                    className={styles.sellButton}
                    onClick={() => handleSellClick(userItem.id)}
                  >
                    Sell
                  </button>
                </div>
              )}

              {sellingItemId === userItem.id && (
                <div className={styles.priceSection}>
                  <div className={styles.sellBox}>
                    <div className={styles.sellInputGroup}>
                      <label htmlFor={`price-${userItem.id}`}>Price (Gems):</label>
                      <input
                        id={`price-${userItem.id}`}
                        type="number"
                        min="0"
                        step="1"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        className={styles.sellInput}
                        placeholder="Enter price"
                      />
                    </div>
                    {sellError && <p className={styles.sellError}>{sellError}</p>}
                    <div className={styles.sellActions}>
                      <button 
                        className={styles.acceptButton}
                        onClick={() => handleAcceptSell(userItem.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className={styles.cancelButton}
                        onClick={handleCancelSell}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
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
  )
}

export default UserItemsPage;