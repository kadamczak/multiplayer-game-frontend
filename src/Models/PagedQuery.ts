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
  const prefix = addPrefix ? 'PagedQuery.' : '';

  const entries: [string, string | number | undefined][] = [
    ['searchPhrase', query.searchPhrase ?? undefined],
    ['sortBy', query.sortBy ?? undefined],
    ['sortDirection', query.sortDirection],
    ['pageNumber', query.pageNumber],
    ['pageSize', query.pageSize],
  ];

  entries.forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(prefix + key, value.toString());
    }
  });

  return params;
};
