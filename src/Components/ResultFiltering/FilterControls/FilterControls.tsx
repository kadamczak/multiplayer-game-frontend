import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './FilterControls.module.css'
import type { PagedQuery } from '../../../Models/PagedQuery'
import { SortDirection } from '../../../Constants/SortDirection'

interface SortOption {
  value: string;
  label: string;
}

interface FilterControlsProps {
  query: PagedQuery;
  onQueryChange: (newQuery: PagedQuery) => void;
  sortOptions: SortOption[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  showSortBy?: boolean;
  showSortDirection?: boolean;
  showPageSize?: boolean;
}

const FilterControls = ({
  query,
  onQueryChange,
  sortOptions,
  searchPlaceholder,
  showSearch = true,
  showSortBy = true,
  showSortDirection = true,
  showPageSize = true,
}: FilterControlsProps) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState(query.searchPhrase || '');
  
  const defaultSearchPlaceholder = searchPlaceholder || t('common.searchPlaceholder');

  const handleSearch = () => {
    onQueryChange({ ...query, searchPhrase: searchInput, pageNumber: 1 });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.filtersSection}>
      {showSearch && (
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder={defaultSearchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className={styles.searchInput}
          />
          <button
            onClick={handleSearch}
            className={styles.searchButton}
          >
            {t('common.search')}
          </button>
        </div>
      )}

      <div className={styles.filterControls}>
        {showSortBy && sortOptions.length > 0 && (
          <div className={styles.filterGroup}>
            <label>{t('common.sortBy')}</label>
            <select
              value={query.sortBy || ''}
              onChange={(e) => onQueryChange({ ...query, sortBy: e.target.value || null, pageNumber: 1 })}
              className={styles.select}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {showSortDirection && (
          <div className={styles.filterGroup}>
            <label>{t('common.direction')}</label>
            <select
              value={query.sortDirection || SortDirection.Ascending}
              onChange={(e) => onQueryChange({ ...query, sortDirection: e.target.value as SortDirection })}
              className={styles.select}
            >
              <option value={SortDirection.Ascending}>{t('common.ascending')}</option>
              <option value={SortDirection.Descending}>{t('common.descending')}</option>
            </select>
          </div>
        )}

        {showPageSize && (
          <div className={styles.filterGroup}>
            <label>{t('common.perPage')}</label>
            <select
              value={query.pageSize || 10}
              onChange={(e) => onQueryChange({ ...query, pageSize: parseInt(e.target.value), pageNumber: 1 })}
              className={styles.select}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterControls;
export type { SortOption };
