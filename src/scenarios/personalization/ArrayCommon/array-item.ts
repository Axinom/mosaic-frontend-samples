export type SortProperty =
  | 'id'
  | 'dateModified'
  | 'sortString'
  | 'sortNumber'
  | 'sortDate';

export type SortDirection = 'asc' | 'desc';

export const sortPropertyOptions: { text: string; value: SortProperty }[] = [
  { text: 'id (service-generated)', value: 'id' },
  { text: 'dateModified (service-owned)', value: 'dateModified' },
  { text: 'sortString', value: 'sortString' },
  { text: 'sortNumber', value: 'sortNumber' },
  { text: 'sortDate', value: 'sortDate' },
];

export const sortDirectionOptions: { text: string; value: SortDirection }[] = [
  { text: 'asc', value: 'asc' },
  { text: 'desc', value: 'desc' },
];

export interface ArrayItem {
  key: string;
  value: unknown;
  /** Service-generated ID. */
  id: string;
  /** Customer-owned ID. `null` for legacy items without a qualifying `value.id`. */
  itemId: string | null;
  sortString: string | null;
  sortNumber: number | null;
  sortDate: string | null;
  dateModified: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  /** Opaque continuation token. Never decode or construct it. */
  endCursor: string | null;
}

export interface ArrayItemsPage {
  totalCount: number;
  data: ArrayItem[];
  pageInfo: PageInfo;
}

/** The favorites value shape written by both the deprecated and the recommended scenarios. */
export interface FavoriteValue {
  id: string;
  title?: string;
}

/**
 * Returns a human readable label for a stored item value.
 * Item values can be any JSON, so a `title` is not guaranteed.
 */
export const describeValue = (value: unknown): string => {
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as FavoriteValue).title === 'string'
  ) {
    return (value as FavoriteValue).title as string;
  }
  return JSON.stringify(value);
};
