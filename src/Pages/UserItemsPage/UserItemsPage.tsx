import { useEffect, useState } from 'react'
import styles from './UserItemsPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { getCurrentUserItemsAPI } from '../../Services/ItemService'
import { fetchImageWithCache } from '../../Services/ApiMethodHelpers'
import { type UserItemSimplifiedResponse, ItemTypeDisplay } from '../../Models/ItemModels'
import { useNavigate } from 'react-router-dom'

const UserItemsPage = () => {
  const navigate = useNavigate();
  const { accessToken, setAccessToken } = useAuth();
  const [items, setItems] = useState<UserItemSimplifiedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');

      const result = await getCurrentUserItemsAPI(accessToken, (newToken) => {
        setAccessToken(newToken); // Update token in context on refresh
      });

      if (result.success) {
        setItems(result.data);
        
        // Load thumbnails for all items
        const newThumbnails = new Map<string, string>();
        await Promise.all(
          result.data.map(async (userItem) => {
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

      setLoading(false);
    }

    fetchItems();
  }, [accessToken, setAccessToken]);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>My Items</h1>
      
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul>
          {items.map((userItem) => (
            <li key={userItem.id}>
              {thumbnails.get(userItem.id) && (
                <img 
                  src={thumbnails.get(userItem.id)} 
                  alt={userItem.item.name}
                  className={styles.thumbnail}
                />
              )}
              <div className={styles.itemContent}>
                <strong>{userItem.item.name}</strong>
                <p>{ItemTypeDisplay[userItem.item.type]}</p>
                <p>{userItem.item.description}</p>
                {userItem.hasActiveOffer && (
                  <p className={styles.offerStatus}>Awaiting Trade</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UserItemsPage;