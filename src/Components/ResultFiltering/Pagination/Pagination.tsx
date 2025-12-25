import { useTranslation } from 'react-i18next'
import styles from './Pagination.module.css'
import type { PagedResponse } from '../../../Models/PagedResponse'

interface PaginationProps {
  pagedResponse: PagedResponse<any>;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

const Pagination = ({ pagedResponse, currentPage, onPageChange, itemLabel = 'items' }: PaginationProps) => {
  const { t } = useTranslation();

  if (pagedResponse.totalPages <= 1) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={styles.pageButton}
      >
        {t('common.previous')}
      </button>
      
      <span className={styles.pageInfo}>
        {t('common.page')} {currentPage} {t('common.of')} {pagedResponse.totalPages}
        {' '}({pagedResponse.itemsFrom}-{pagedResponse.itemsTo} {t('common.of')} {pagedResponse.totalItemsCount} {itemLabel})
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= pagedResponse.totalPages}
        className={styles.pageButton}
      >
        {t('common.next')}
      </button>
    </div>
  );
}

export default Pagination;
