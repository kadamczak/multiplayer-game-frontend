import { useState } from 'react'
import styles from './CreateOfferComponent.module.css'
import { useAuth } from '../../Context/useAuth'
import { createUserItemOfferAPI } from '../../Services/ItemService'
import { type UserItemResponse, ItemTypeDisplay } from '../../Models/ItemModels'

type CreateOfferComponentProps = {
  userItems: UserItemResponse[]
  onSuccess: () => void
  onCancel: () => void
}

const CreateOfferComponent = ({ userItems, onSuccess, onCancel }: CreateOfferComponentProps) => {
  const { accessToken, setAccessToken } = useAuth()
  
  const [selectedItemId, setSelectedItemId] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId || !offerPrice) return

    const price = parseFloat(offerPrice)
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price')
      return
    }

    const result = await createUserItemOfferAPI(
      accessToken,
      setAccessToken,
      { userItemId: selectedItemId, price }
    )

    if (result.success) {
      setSelectedItemId('')
      setOfferPrice('')
      setError('')
      onSuccess()
    } else {
      setError(result.problem.title || 'Failed to create offer')
    }
  }

  const handleCancel = () => {
    setSelectedItemId('')
    setOfferPrice('')
    setError('')
    onCancel()
  }

  return (
    <form className={styles.createForm} onSubmit={handleSubmit}>
      <h2>Create New Offer</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
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
        <button type="button" onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
      </div>
    </form>
  )
}

export default CreateOfferComponent
