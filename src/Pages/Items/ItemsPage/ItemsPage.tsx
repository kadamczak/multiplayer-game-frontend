import { useEffect, useState } from 'react'
import styles from './ItemsPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getItemsAPI, createItemAPI, updateItemAPI, deleteItemAPI } from '../../../Services/ItemService'
import type { ItemResponse } from '../../../Models/ItemModels'

const ItemsPage = () => {
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchItems = async () => {
    setIsLoading(true);
    setError('');
    
    // Only show loading indicator if request takes longer than 200ms
    const loadingTimer = setTimeout(() => setShowLoading(true), 200);

    const result = await getItemsAPI(accessToken, (newToken) => {
      setAccessToken(newToken);
    });

    if (result.success) {
      setItems(result.data);
    } else {
      setError(result.problem.title || 'Failed to load items');
    }

    clearTimeout(loadingTimer);
    setShowLoading(false);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, [accessToken, setAccessToken]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    const result = await createItemAPI(accessToken, setAccessToken, formData);

    if (result.success) {
      setItems([...items, result.data]);
      setFormData({ name: '', description: '' });
      setIsCreating(false);
    } else {
      setError(result.problem.title || 'Failed to create item');
    }
  };

  const handleUpdate = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    const result = await updateItemAPI(accessToken, setAccessToken, id, formData);

    if (result.success) {
      setItems(items.map(item => item.id === id ? result.data : item));
      setFormData({ name: '', description: '' });
      setEditingId(null);
    } else {
      setError(result.problem.title || 'Failed to update item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const result = await deleteItemAPI(accessToken, setAccessToken, id);

    if (result.success) {
      setItems(items.filter(item => item.id !== id));
    } else {
      setError(result.problem.title || 'Failed to delete item');
    }
  };

  const startEdit = (item: ItemResponse) => {
    setEditingId(item.id);
    setFormData({ name: item.name, description: item.description });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', description: '' });
  };

  if (showLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Items</h1>
        {!isCreating && !editingId && (
          <button className={styles.createButton} onClick={() => setIsCreating(true)}>
            Create New Item
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isCreating && (
        <form className={styles.form} onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Item name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
            required
          />
          <textarea
            placeholder="Item description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={styles.textarea}
            required
          />
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>Create</button>
            <button type="button" onClick={cancelEdit} className={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id} className={styles.itemCard}>
              {editingId === item.id ? (
                <form onSubmit={(e) => handleUpdate(e, item.id)}>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={styles.input}
                    required
                  />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={styles.textarea}
                    required
                  />
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.saveButton}>Save</button>
                    <button type="button" onClick={cancelEdit} className={styles.cancelButton}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className={styles.itemContent}>
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <button onClick={() => startEdit(item)} className={styles.updateButton}>Update</button>
                    <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ItemsPage;