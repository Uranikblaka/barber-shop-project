import type { Order, CartItem } from '../types';
import { products } from './products';

const mockCartItems: CartItem[] = [
  {
    product: products[0],
    quantity: 1
  },
  {
    product: products[1],
    quantity: 2
  }
];

export const orders: Order[] = [
  {
    id: "order_001",
    customerId: "customer_001",
    items: mockCartItems,
    status: "shipped",
    totalAmount: 92,
    shippingAddress: {
      id: "addr_001",
      type: "home",
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      isDefault: true
    },
    createdAt: "2025-01-10T16:45:00Z",
    trackingNumber: "TRK123456789"
  }
];