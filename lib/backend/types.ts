export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface BackendError {
  code: string;
  message: string;
  hint?: string;
  status: number;
}

export type BackendResult<T> =
  | { ok: true; data: T; pagination?: Pagination }
  | { ok: false; error: BackendError };

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
