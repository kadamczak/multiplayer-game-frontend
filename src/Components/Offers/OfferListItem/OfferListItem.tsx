import styles from './OfferListItem.module.css'
import { type UserItemOfferResponse, ItemTypeDisplay } from '../../../Models/ItemModels'

interface OfferListItemProps {
  offer: UserItemOfferResponse;
  thumbnailUrl?: string;
  isOwnOffer: boolean;
  canAfford: boolean;
  onBuy: (offerId: string) => void;
}

const OfferListItem = ({ offer, thumbnailUrl, isOwnOffer, canAfford, onBuy }: OfferListItemProps) => {
  return (
    <li className={styles.offerItem}>
      <div className={styles.thumbnailContainer}>
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
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
        <p className={styles.seller}>Seller: {offer.sellerUsername}</p>
      </div>
      <div className={styles.priceSection}>
        <span className={styles.priceLabel}>Price</span>
        <span className={styles.price}>{offer.price} Gems</span>
        {!isOwnOffer && (
          <button
            className={styles.buyButton}
            onClick={() => onBuy(offer.id)}
            disabled={!canAfford}
          >
            {canAfford ? 'Buy' : 'Insufficient Funds'}
          </button>
        )}
      </div>
    </li>
  );
}

export default OfferListItem;
