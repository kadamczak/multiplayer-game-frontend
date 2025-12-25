import { useState, useEffect, useCallback, useRef } from 'react'
import type { PagedQuery } from '../Models/PagedQuery'
import { defaultPagedQuery } from '../Models/PagedQuery'
import type { PagedResponse } from '../Models/PagedResponse'
import type { ApiResponse } from '../Models/ApiResponse'

interface UsePagedDataOptions<T> {
  fetchFunction: (query: PagedQuery) => Promise<ApiResponse<PagedResponse<T>>>;
  defaultSortBy?: string;
  onError?: (error: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

interface UsePagedDataReturn<T> {
  pagedResponse: PagedResponse<T> | null;
  query: PagedQuery;
  setQuery: (query: PagedQuery) => void;
  loadingState: 'initial' | 'loaded' | 'refreshing';
  showLoading: boolean;
  error: string;
  setError: (error: string) => void;
  refresh: () => Promise<void>;
}

export const usePagedData = <T,>({
  fetchFunction,
  defaultSortBy,
  onError,
  onLoadingChange,
}: UsePagedDataOptions<T>): UsePagedDataReturn<T> => {
  const [pagedResponse, setPagedResponse] = useState<PagedResponse<T> | null>(null);
  const [query, setQuery] = useState<PagedQuery>({ 
    ...defaultPagedQuery, 
    sortBy: defaultSortBy || null 
  });
  const [loadingState, setLoadingState] = useState<'initial' | 'loaded' | 'refreshing'>('initial');
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');
  const loadingStateRef = useRef<'initial' | 'loaded' | 'refreshing'>('initial');

  useEffect(() => {
    loadingStateRef.current = loadingState;
  }, [loadingState]);

  const fetchData = useCallback(async () => {
    setError('');
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;
    const isInitialLoad = loadingStateRef.current === 'initial';
      
    if (isInitialLoad) {
      onLoadingChange?.(true);
      loadingTimer = setTimeout(() => setShowLoading(true), 200);
    } else {
      setLoadingState('refreshing');
    }

    const result = await fetchFunction(query);

    if (result.success) {
      setPagedResponse(result.data);
    } else {
      const errorMessage = result.problem.title || 'Failed to load data';
      setError(errorMessage);
      onError?.(errorMessage);
    }

    if (loadingTimer) clearTimeout(loadingTimer);
    onLoadingChange?.(false);
    setLoadingState('loaded');
    setShowLoading(false);
  }, [query, fetchFunction, onError, onLoadingChange]);

  useEffect(() => {
    fetchData();
  }, [query]);

  return {
    pagedResponse,
    query,
    setQuery,
    loadingState,
    showLoading,
    error,
    setError,
    refresh: fetchData,
  };
};
