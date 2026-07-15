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

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  products?: Product[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  price_adjust: number;
  is_default: boolean;
  in_stock: boolean;
}

export interface ProductFeature {
  id: number;
  product_id: number;
  text: string;
}

export interface ProductSpec {
  id: number;
  product_id: number;
  label: string;
  value: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  public_id: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants: ProductVariant[];
  features: ProductFeature[];
  specs: ProductSpec[];
  images: ProductImage[];
}
