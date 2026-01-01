import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './OffersPage.module.css'
import { useAuth } from '../../../Context/useAuth'
import { useLoading } from '../../../Context/useLoading'
import { getOffersAPI, purchaseUserItemOfferAPI } from '../../../Services/ItemService'
import { getUserGameInfoAPI } from '../../../Services/UserService'
import { fetchImageWithCache } from '../../../Services/ApiMethodHelpers'
import { type UserItemOfferResponse } from '../../../Models/ItemModels'
import type { UserGameInfoResponse } from '../../../Models/UserModels'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { usePagedData } from '../../../Helpers/usePagedData'
import FilterControls, { type SortOption } from '../../../Components/ResultFiltering/FilterControls/FilterControls'
import Pagination from '../../../Components/ResultFiltering/Pagination/Pagination'
import OfferListItem from '../../../Components/Offers/OfferListItem/OfferListItem'

const OffersPage = () => {
  const { t } = useTranslation();
  const { accessToken, setAccessToken } = useAuth();
  const { setIsLoading } = useLoading();
  
  const SORT_OPTIONS: SortOption[] = [
    { value: 'Name', label: t('items.sortByName') },
    { value: 'Type', label: t('items.sortByType') },
    { value: 'SellerUserName', label: t('items.sortBySeller') },
    { value: 'Price', label: t('items.sortByPrice') },
  ];
  
  const [userInfo, setUserInfo] = useState<UserGameInfoResponse | null>(null);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());

  const fetchOffers = useCallback(
    (query: PagedQuery) => getOffersAPI(accessToken, setAccessToken, query, true),
    [accessToken, setAccessToken]
  );

  const {
    pagedResponse,
    query,
    setQuery,
    loadingState,
    showLoading,
    error,
    setError,
  } = usePagedData<UserItemOfferResponse>({
    fetchFunction: fetchOffers,
    defaultSortBy: 'Name',
    onLoadingChange: setIsLoading,
  });

  
  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (pagedResponse) {
      loadThumbnails(pagedResponse.items);
    }
  }, [pagedResponse]);

  const fetchUserInfo = async () => {
    const result = await getUserGameInfoAPI(accessToken, setAccessToken);
    result.success && setUserInfo(result.data);
  };

  const loadThumbnails = async (offers: UserItemOfferResponse[]) => {
    const newThumbnails = new Map<string, string>();
    await Promise.all(
      offers.map(async (offer) => {
        const thumbnailUrl = await fetchImageWithCache(offer.userItem.item.thumbnailUrl, accessToken);
        if (thumbnailUrl) {
          newThumbnails.set(offer.id, thumbnailUrl);
        }
      })
    );
    setThumbnails(newThumbnails);
  };

  const handleBuy = async (offerId: string) => {
    const result = await purchaseUserItemOfferAPI(accessToken, setAccessToken, offerId);

    if (result.success) {
      const userInfoResult = await getUserGameInfoAPI(accessToken, setAccessToken);
      userInfoResult.success && setUserInfo(userInfoResult.data);
      // Refresh the offers list
      setQuery({ ...query });
    } else {
      setError(result.problem.title || t('items.failedToPurchase'));
    }
  };


  if (showLoading) {
    return <div className={styles.container}>{t('common.loading')}</div>;
  }

  
  return (
    <div className={styles.container}>
      {loadingState === 'refreshing' && (
        <div className={styles.refreshIndicator}>
          {t('items.updating')}
        </div>
      )}
      <div className={styles.header}>
        <h1>{t('items.activeOffers')}</h1>
        <div className={styles.headerRight}>

          <div className={styles.balanceDisplay}>
            <span className={styles.balanceLabel}>{t('items.yourBalance')}</span>
            <span className={styles.balanceValue}>
              {userInfo ? `${userInfo.balance} ${t('items.gems')}` : t('items.gems')}
            </span>
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <FilterControls
        query={query}
        onQueryChange={setQuery}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder={t('items.searchOffers')}
      />
  
      {pagedResponse && pagedResponse.items.length === 0 ? (
        <p>{t('items.noActiveOffers')}</p>
      ) : (
        <ul className={styles.offersList}>
          {pagedResponse && pagedResponse.items.map((offer) => {
            const isOwnOffer = userInfo?.id === offer.sellerId;
            const canAfford = userInfo ? userInfo.balance >= offer.price : false;

            return (
              <OfferListItem
                key={offer.id}
                offer={offer}
                thumbnailUrl={thumbnails.get(offer.id)}
                isOwnOffer={isOwnOffer}
                canAfford={canAfford}
                onBuy={handleBuy}
              />
            );
          })}
        </ul>
      )}

      {pagedResponse && (
        <Pagination
          pagedResponse={pagedResponse}
          currentPage={query.pageNumber || 1}
          onPageChange={(page) => setQuery({ ...query, pageNumber: page })}
        />
      )}
    </div>
  );
}

export default OffersPage