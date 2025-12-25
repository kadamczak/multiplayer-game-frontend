import { useTranslation } from 'react-i18next'
import styles from './UserItemListItem.module.css'
import { type UserItemResponse, getItemTypeTranslation } from '../../../Models/ItemModels'

interface UserItemListItemProps {
  userItem: UserItemResponse;
  thumbnailUrl?: string;
  isBeingSold: boolean;
  sellPrice: string;
  sellError: string;
  onSellClick: (itemId: string) => void;
  onCancelSell: () => void;
  onAcceptSell: (itemId: string) => void;
  onCancelOffer: (offerId: string) => void;
  onPriceChange: (price: string) => void;
}

const UserItemListItem = ({
  userItem,
  thumbnailUrl,
  isBeingSold,
  sellPrice,
  sellError,
  onSellClick,
  onCancelSell,
  onAcceptSell,
  onCancelOffer,
  onPriceChange,
}: UserItemListItemProps) => {
  const { t } = useTranslation();
  
  return (
    <li className={styles.userItem}>
      <div className={styles.thumbnailWrapper}>
        {thumbnailUrl && (
          <img 
            src={thumbnailUrl} 
            alt={userItem.item.name}
            className={styles.thumbnail}
          />
        )}
      </div>
      <div className={styles.itemContent}>
        <strong>{userItem.item.name}</strong>
        <p>{getItemTypeTranslation(userItem.item.type, t)}</p>
        <p>{userItem.item.description}</p>
      </div>
      
      {userItem.activeOfferId && (
        <div className={styles.priceSection}>
          <span className={styles.priceLabel}>{t('items.awaitingTrade')}</span>
          <span className={styles.price}>{userItem.activeOfferPrice} {t('items.gems')}</span>
          <button 
            className={styles.cancelOfferButton}
            onClick={() => onCancelOffer(userItem.activeOfferId!)}
          >
            {t('items.cancel')}
          </button>
        </div>
      )}

      {!userItem.activeOfferId && !isBeingSold && (
        <div className={styles.priceSection}>
          <button 
            className={styles.sellButton}
            onClick={() => onSellClick(userItem.id)}
          >
            {t('items.sell')}
          </button>
        </div>
      )}

      {isBeingSold && (
        <div className={styles.priceSection}>
          <div className={styles.sellBox}>
            <div className={styles.sellInputGroup}>
              <label htmlFor={`price-${userItem.id}`}>{t('items.priceGems')}</label>
              <input
                id={`price-${userItem.id}`}
                type="number"
                min="0"
                step="1"
                value={sellPrice}
                onChange={(e) => onPriceChange(e.target.value)}
                className={styles.sellInput}
                placeholder={t('items.enterPrice')}
              />
            </div>
            {sellError && <p className={styles.sellError}>{sellError}</p>}
            <div className={styles.sellActions}>
              <button 
                className={styles.acceptButton}
                onClick={() => onAcceptSell(userItem.id)}
              >
                {t('items.accept')}
              </button>
              <button 
                className={styles.cancelButton}
                onClick={onCancelSell}
              >
                {t('items.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export default UserItemListItem;
