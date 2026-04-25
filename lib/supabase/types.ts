export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  subcategory: string | null;
  description: string | null;
  price: number;
  currency: string;
  image_url: string;
  unit_label: string | null;
  in_stock: boolean;
  consumable: boolean;
  default_estimated_duration_days: number | null;
  subscription: boolean;
  cycle_days: number | null;
  refundable: boolean;
  refund_window_days: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CartItem {
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  products?: Product;
}

export interface Membership {
  id: string;
  user_id: string;
  product_id: string | null;
  status: "inactive" | "active" | "cancelled" | "refunded";
  started_at: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
  bunq_payment_id: string | null;
  created_by: "user" | "bunqpal";
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  checkout_session_id: string | null;
  merchant: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: "paid" | "refund_requested" | "refunded" | "cancelled";
  payment_method: "iban" | "card" | "bunq";
  payment_reference: string | null;
  bunq_payment_id: string | null;
  bunq_payment_status: string | null;
  bunq_account_label: string | null;
  invoice_number: string | null;
  created_by: "user" | "bunqpal";
  refund_window_ends_at: string | null;
  refund_requested_at: string | null;
  refunded_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}
