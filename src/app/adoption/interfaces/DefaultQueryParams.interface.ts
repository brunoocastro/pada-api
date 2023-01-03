export const AdoptionOrderingOptions = ['name', 'breed', 'species'] as any;

export interface AdoptionQueryParams {
  search: string;
  page: number;
  page_size: number;
  ordering: {
    [key: string]: 'asc' | 'desc';
  }[];
  only_available: boolean;
}
