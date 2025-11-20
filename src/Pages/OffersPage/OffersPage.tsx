import { useEffect, useState } from 'react'
import styles from './OffersPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { getOffersAPI, getCurrentUserItemsAPI, createUserItemOfferAPI, purchaseUserItemOfferAPI } from '../../Services/ItemService'
import { getUserGameInfoAPI } from '../../Services/UserService'
import { fetchImageWithCache } from '../../Services/ApiMethodHelpers'
import { type ActiveUserItemOfferResponse, type UserItemSimplifiedResponse, ItemTypeDisplay } from '../../Models/ItemModels'
import type { UserGameInfoResponse } from '../../Models/UserModels'

const OffersPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const [offers, setOffers] = useState<ActiveUserItemOfferResponse[]>([]);
  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);
  const [userItems, setUserItems] = useState<UserItemSimplifiedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      const [offersResult, userInfoResult, userItemsResult] = await Promise.all([
        getOffersAPI(accessToken, (newToken) => {
          setAccessToken(newToken);
        }),
        getUserGameInfoAPI(accessToken, (newToken) => {
          setAccessToken(newToken);
        }),
        getCurrentUserItemsAPI(accessToken, (newToken) => {
          setAccessToken(newToken);
        })
      ]);

      if (offersResult.success) {
        setOffers(offersResult.data);
        
        // Load thumbnails for all offers
        const newThumbnails = new Map<string, string>();
        await Promise.all(
          offersResult.data.map(async (offer) => {
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

      setLoading(false);
    }

    fetchData();
  }, [accessToken, setAccessToken]);

  const handleBuy = async (offerId: string) => {
    const result = await purchaseUserItemOfferAPI(accessToken, setAccessToken, offerId);

    if (result.success) {
      // Refresh data after successful purchase
      const [offersResult, userInfoResult, userItemsResult] = await Promise.all([
        getOffersAPI(accessToken, setAccessToken),
        getUserGameInfoAPI(accessToken, setAccessToken),
        getCurrentUserItemsAPI(accessToken, setAccessToken)
      ]);

      if (offersResult.success) {
        setOffers(offersResult.data);
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
        getOffersAPI(accessToken, setAccessToken),
        getCurrentUserItemsAPI(accessToken, setAccessToken)
      ]);

      if (offersResult.success) {
        setOffers(offersResult.data);
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

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
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
        <ul>
          {offers.map((offer) => {
            const isOwnOffer = userInfo?.id === offer.userItem.userId;
            const canAfford = userInfo ? userInfo.balance >= offer.price : false;

            return (
              <li key={offer.id}>
                {thumbnails.get(offer.id) && (
                  <img 
                    src={thumbnails.get(offer.id)} 
                    alt={offer.userItem.item.name}
                    className={styles.thumbnail}
                  />
                )}
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
    </div>
  )
}

export default OffersPage