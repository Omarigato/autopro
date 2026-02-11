export interface UnifiedResponse<T> {
  data: T | null;
  code: number;
  message: string;
}
