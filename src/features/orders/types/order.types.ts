export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface OrderItem {
  product: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export type OrderStatus =
  "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "COD";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  cartId: string;
  version: number;
  shippingAddress: ShippingAddress;
  paymentMethod: "COD";
}
