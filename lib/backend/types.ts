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
  // Backend tags these `omitempty` — an empty relation is dropped from the
  // JSON entirely rather than sent as `[]`, so these are genuinely optional.
  variants?: ProductVariant[];
  features?: ProductFeature[];
  specs?: ProductSpec[];
  images?: ProductImage[];
}

export type InstallmentStatus = "pending" | "approved" | "declined" | "forwarded";
export type PlanType = "maritech" | "partner";
export type EmployerType = "salary_earner" | "business_owner";

export interface InstallmentDocument {
  id: number;
  application_id: number;
  doc_type: string;
  file_url: string;
  public_id: string;
  uploaded_at: string;
}

export interface InstallmentApplication {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_id: number;
  variant_id?: number;
  product?: Product;
  variant?: ProductVariant;
  plan_type: PlanType;
  term_months: number;
  equity_percent: number;
  company_name: string;
  employer_type: EmployerType;
  notes: string;
  total_value: number;
  initial_payment: number;
  financed_amount: number;
  monthly_payment: number;
  doc_fee: number;
  mgmt_fee: number;
  status: InstallmentStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  decline_reason?: string;
  forwarded_at?: string;
  // Backend tags this `omitempty` — no documents uploaded means the key is
  // dropped entirely, not sent as `[]`.
  documents?: InstallmentDocument[];
  created_at: string;
}

export interface InstallmentSettings {
  id: number;
  maritech_max_slots: number;
  maritech_max_months: number;
  maritech_upfront_pct: number;
  maritech_monthly_rate: number;
  doc_fee: number;
  mgmt_fee_pct: number;
  partner_email: string;
  auto_forward_partner: boolean;
}

export interface Permission {
  id: number;
  group_id: number;
  name: string;
  display_name: string;
  action: string;
  description: string;
}

export interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_system: boolean;
  created_by?: string;
  permissions?: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  last_login_at?: string;
  invited_by?: string;
  created_at: string;
  updated_at: string;
  // Backend tags this `omitempty` — a user with no roles assigned has the
  // key dropped entirely, not sent as `[]`.
  roles?: Role[];
}

export interface Invitation {
  id: string;
  email: string;
  expires_at: string;
  roles: string[];
  dev_code?: string;
}

export interface Me {
  user_id: string;
  user_type: "dev_admin" | "regular";
  name: string;
  email: string;
  is_active: boolean;
  roles: string[];
  /** "*" means every permission (super_admin bypass), not a literal permission name. */
  permissions: string[];
}

export interface AcceptInvitationResponse {
  id: string;
  name: string;
  email: string;
}
