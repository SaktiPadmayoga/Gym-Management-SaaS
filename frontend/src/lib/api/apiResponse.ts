export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  } | null;
};