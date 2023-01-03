export interface DefaultAdoptionsResponse<T> {
  total: number;
  page: number;
  page_size: number;
  registers: Partial<T>[];
}
