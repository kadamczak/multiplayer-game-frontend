import { useEffect, useState } from 'react'
import styles from './UserItemsPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { useLoading } from '../../Context/useLoading'
import { getCurrentUserItemsAPI } from '../../Services/ItemService'
import { fetchImageWithCache } from '../../Services/ApiMethodHelpers'
import { type UserItemResponse, ItemTypeDisplay } from '../../Models/ItemModels'

const UserItemsPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { isLoading, setIsLoading } = useLoading();

  const [items, setItems] = useState<UserItemResponse[]>([]);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());

  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError('');
      
      const loadingTimer = setTimeout(() => setShowLoading(true), 200);

      const result = await getCurrentUserItemsAPI(accessToken, (newToken) => {
        setAccessToken(newToken);
      });

      if (result.success) {
        setItems(result.data);

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

      clearTimeout(loadingTimer);
      setShowLoading(false);
      setIsLoading(false);
    }

    fetchItems();
  }, [accessToken, setAccessToken]);

  if (showLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>My Items</h1>
      
      {!isLoading && items.length === 0 ? (
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