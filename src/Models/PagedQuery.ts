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

export const pagedQueryToParams = (query: PagedQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.searchPhrase !== null && query.searchPhrase !== undefined) {
    params.append('searchPhrase', query.searchPhrase);
  }
  if (query.sortBy !== null && query.sortBy !== undefined) {
    params.append('sortBy', query.sortBy);
  }
  if (query.sortDirection !== undefined) {
    params.append('sortDirection', query.sortDirection);
  }
  if (query.pageNumber !== undefined) {
    params.append('pageNumber', query.pageNumber.toString());
  }
  if (query.pageSize !== undefined) {
    params.append('pageSize', query.pageSize.toString());
  }

  return params;
};
