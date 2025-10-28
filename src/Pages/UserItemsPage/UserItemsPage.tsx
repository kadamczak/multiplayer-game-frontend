import { useEffect, useState } from 'react'
import styles from './UserItemsPage.module.css'
import { useAuth } from '../../Context/useAuth'
import { getCurrentUserItemsAPI } from '../../Services/UserItemService'
import type { UserItemResponse } from '../../Models/UserItem'

const UserItemsPage = () => {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<UserItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');

      const result = await getCurrentUserItemsAPI(accessToken);

      if (result.success) {
        setItems(result.data);
      } else {
        setError(result.problem.title);
      }

      setLoading(false);
    }

    fetchItems();
  }, [])

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
            <li key={userItem.id}>{userItem.item.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UserItemsPage;