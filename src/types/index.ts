// Core type definitions
export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  category: 'Haircut' | 'Beard' | 'Shave' | 'Styling' | 'Treatment';
  image: string;
  featured: boolean;
}

export interface Barber {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  specialties: string[];
  rating: number;
  yearsExperience: number;
  featured: boolean;
  workingHours: {
    [key: string]: { start: string; end: string } | null;
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
  barberId?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'Pomade' | 'Clay' | 'Shampoo' | 'Conditioner' | 'Tools' | 'Beard Care';
  brand: string;
  image: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  ingredients?: string[];
  howToUse?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  totalPrice: number;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: Address;
  createdAt: string;
  trackingNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  preferences: {
    preferredBarber?: string;
    favoriteServices: string[];
    notifications: boolean;
  };
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  serviceId?: string;
  barberId?: string;
  createdAt: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar?: string;
}