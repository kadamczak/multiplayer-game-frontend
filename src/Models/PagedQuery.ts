import { SortDirection } from "../Constants/SortDirection";

export interface PagedQuery {
  searchPhrase?: string | null;
  sortBy?: string | null;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
}

export const defaultPagedQuery: PagedQuery = {
  searchPhrase: null,
  sortBy: null,
  sortDirection: SortDirection.Ascending,
  pageNumber: 1,
  pageSize: 10
};

export const pagedQueryToParams = (query: PagedQuery, addPrefix: boolean): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.searchPhrase !== null && query.searchPhrase !== undefined) {
    addPrefix
    ? params.append('PagedQuery.searchPhrase', query.searchPhrase)
    : params.append('searchPhrase', query.searchPhrase);
  }
  if (query.sortBy !== null && query.sortBy !== undefined) {
    addPrefix
    ? params.append('PagedQuery.sortBy', query.sortBy)
    : params.append('sortBy', query.sortBy);
  }
  if (query.sortDirection !== undefined) {
    addPrefix
    ? params.append('PagedQuery.sortDirection', query.sortDirection)
    : params.append('sortDirection', query.sortDirection);
  }
  if (query.pageNumber !== undefined) {
    addPrefix
    ? params.append('PagedQuery.pageNumber', query.pageNumber.toString())
    : params.append('pageNumber', query.pageNumber.toString());
  }
  if (query.pageSize !== undefined) {
    addPrefix
    ? params.append('PagedQuery.pageSize', query.pageSize.toString())
    : params.append('pageSize', query.pageSize.toString());
  }

  return params;
};
