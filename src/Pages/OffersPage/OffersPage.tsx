import { useEffect, useState } from 'react'
import styles from './OffersPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { getOffersAPI } from '../../Services/ItemService'
import { type UserItemOfferResponse, ItemTypeDisplay } from '../../Models/ItemModels'

const OffersPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const [offers, setOffers] = useState<UserItemOfferResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError('');

      const result = await getOffersAPI(accessToken, (newToken) => {
        setAccessToken(newToken);
      });

      if (result.success) {
        setOffers(result.data);
      } else {
        setError(result.problem.title || 'Failed to load offers');
      }

      setLoading(false);
    }

    fetchOffers();
  }, [accessToken, setAccessToken]);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Available Offers</h1>
      
      {offers.length === 0 ? (
        <p>No offers available.</p>
      ) : (
        <ul>
          {offers.map((offer) => (
            <li key={offer.id}>
              <div className={styles.itemInfo}>
                <strong>{offer.userItem.item.name}</strong>
                <p>{ItemTypeDisplay[offer.userItem.item.type]}</p>
                <p>{offer.userItem.item.description}</p>
                <p className={styles.seller}>Seller: {offer.userItem.userName}</p>
              </div>
              <div className={styles.priceSection}>
                <span className={styles.priceLabel}>Price</span>
                <span className={styles.price}>{offer.price}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default OffersPage