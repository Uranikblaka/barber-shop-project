// Core type definitions
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // Duration in minutes
  description?: string;
  category?: 'Haircut' | 'Beard' | 'Shave' | 'Styling' | 'Treatment';
  image?: string;
  featured?: boolean;
}

// Extended service interface for frontend display
export interface ServiceDisplay extends Service {
  description: string;
  category: 'Haircut' | 'Beard' | 'Shave' | 'Styling' | 'Treatment';
  image: string;
  featured: boolean;
  durationMin: number; // Alias for duration for backward compatibility
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
}

// Extended product interface for frontend display
export interface ProductDisplay extends Product {
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

export interface Appointment {
  id: string;
  user_id: string;
  service_id: string;
  date: string;
  time: string;
}

export interface AppointmentWithDetails extends Appointment {
  service?: Service;
  user?: User;
}

export interface CreateAppointmentData {
  service_id: string;
  date: string;
  time: string;
}

export interface UpdateAppointmentData {
  service_id?: string;
  date?: string;
  time?: string;
}

// Legacy Booking interface for backward compatibility
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
  username: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}