export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  salePrice: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  zipCode: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'delivered' | 'pending' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid';
  shippingMethod: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}
