export const AdoptionOrderingOptions = ['name', 'breed'] as const;

export interface AdoptionQueryParams {
  search: string;
  page: number;
  page_size: number;
  ordering: {
    [key in typeof AdoptionOrderingOptions[number]]: 'asc' | 'desc';
  }[];
}
