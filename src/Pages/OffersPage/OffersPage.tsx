import { useEffect, useState } from 'react'
import styles from './OffersPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { getOffersAPI } from '../../Services/ItemService'
import { getUserGameInfoAPI } from '../../Services/UserService'
import { type UserItemOfferResponse, ItemTypeDisplay } from '../../Models/ItemModels'
import type { UserGameInfoResponse } from '../../Models/UserModels'

const OffersPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const [offers, setOffers] = useState<UserItemOfferResponse[]>([]);
  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      const [offersResult, userInfoResult] = await Promise.all([
        getOffersAPI(accessToken, (newToken) => {
          setAccessToken(newToken);
        }),
        getUserGameInfoAPI(accessToken, (newToken) => {
          setAccessToken(newToken);
        })
      ]);

      if (offersResult.success) {
        setOffers(offersResult.data);
      } else {
        setError(offersResult.problem.title || 'Failed to load offers');
      }

      if (userInfoResult.success) {
        setUserInfo(userInfoResult.data);
      }

      setLoading(false);
    }

    fetchData();
  }, [accessToken, setAccessToken]);

  const handleBuy = (offerId: string) => {
    // TODO: Implement buy functionality
    console.log('Buy offer:', offerId);
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
        <h1>Available Offers</h1>
        {userInfo && (
          <div className={styles.balanceDisplay}>
            <span className={styles.balanceLabel}>Your Balance:</span>
            <span className={styles.balanceValue}>{userInfo.balance} Gems</span>
          </div>
        )}
      </div>
      
      {offers.length === 0 ? (
        <p>No offers available.</p>
      ) : (
        <ul>
          {offers.map((offer) => {
            const isOwnOffer = userInfo?.id === offer.userItem.userId;
            const canAfford = userInfo ? userInfo.balance >= offer.price : false;

            return (
              <li key={offer.id}>
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