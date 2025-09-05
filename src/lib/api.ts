// Real API client for backend integration
import type { Service, Barber, Product, Booking, Order, Customer, Review, AuthResponse, LoginCredentials, RegisterCredentials, User, Appointment, CreateAppointmentData, UpdateAppointmentData } from '../types';
import { ENV_CONFIG } from '../config/environment';

// Your backend returns data directly, not wrapped in a response object
// So we'll handle both formats for flexibility

interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Global auth state management
let authState: { token: string | null; user: any } = { token: null, user: null };

// Function to update auth state from outside
export const setAuthState = (token: string | null, user: any) => {
  authState = { token, user };
};

// Function to clear auth state
export const clearAuthState = () => {
  authState = { token: null, user: null };
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

// Function to handle auth errors
const handleAuthError = (error: ApiError) => {
  if (error.status === 401 || error.status === 403) {
    // Token is invalid or expired, clear auth state
    clearAuthState();
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const url = `${ENV_CONFIG.API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  const token = authState.token || localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ENV_CONFIG.API_TIMEOUT);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
      
      // Handle authentication errors
      handleAuthError(apiError);
      throw apiError;
    }

    const data = await response.json();
    
    // Handle both wrapped and direct response formats
    if (data && typeof data === 'object' && 'data' in data) {
      // Wrapped format: { data: [...], message: "...", success: true }
      return data.data;
    } else {
      // Direct format: [...] (your current backend format)
      return data;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Retry logic for network errors
    if (retryCount < 3 && 
        (error instanceof Error && error.name === 'AbortError' || 
         error instanceof TypeError)) {
      console.warn(`API request failed, retrying... (${retryCount + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return apiRequest<T>(endpoint, options, retryCount + 1);
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      error
    );
  }
}

export const apiClient = {
  // Services - Full CRUD operations
  async getServices(): Promise<Service[]> {
    return apiRequest<Service[]>('/services');
  },

  async getService(id: string): Promise<Service> {
    return apiRequest<Service>(`/services/${id}`);
  },

  async createService(service: { name: string; price: number; duration: number }): Promise<Service> {
    return apiRequest<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  },

  async updateService(id: string, service: { name?: string; price?: number; duration?: number }): Promise<Service> {
    return apiRequest<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
  },

  async deleteService(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    });
  },

  // Barbers
  async getBarbers(): Promise<Barber[]> {
    return apiRequest<Barber[]>('/barbers');
  },

  async getBarber(id: string): Promise<Barber> {
    return apiRequest<Barber>(`/barbers/${id}`);
  },

  // Products - Full CRUD operations
  async getProducts(): Promise<Product[]> {
    return apiRequest<Product[]>('/products');
  },

  async getProduct(id: string): Promise<Product> {
    return apiRequest<Product>(`/products/${id}`);
  },

  async createProduct(product: { name: string; description: string; price: number }): Promise<Product> {
    return apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: string, product: { name?: string; description?: string; price?: number }): Promise<Product> {
    return apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Appointments - Full CRUD operations
  async getAppointments(): Promise<Appointment[]> {
    return apiRequest<Appointment[]>('/appointments');
  },

  async getAppointment(id: string): Promise<Appointment> {
    return apiRequest<Appointment>(`/appointments/${id}`);
  },

  async createAppointment(appointment: CreateAppointmentData): Promise<Appointment> {
    return apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  },

  async updateAppointment(id: string, appointment: UpdateAppointmentData): Promise<Appointment> {
    return apiRequest<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    });
  },

  async deleteAppointment(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  // Legacy Bookings (for backward compatibility)
  async getBookings(): Promise<Booking[]> {
    return apiRequest<Booking[]>('/bookings');
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    return apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  },

  async updateBooking(id: string, booking: Partial<Booking>): Promise<Booking> {
    return apiRequest<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(booking),
    });
  },

  async deleteBooking(id: string): Promise<void> {
    return apiRequest<void>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    return apiRequest<Order[]>('/orders');
  },

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    return apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    return apiRequest<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return apiRequest<Customer[]>('/customers');
  },

  async getCustomer(id: string): Promise<Customer> {
    return apiRequest<Customer>(`/customers/${id}`);
  },

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    return apiRequest<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    return apiRequest<Review[]>('/reviews');
  },

  async createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    return apiRequest<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  // Availability
  async getAvailableSlots(date: string, serviceId: string, barberId?: string): Promise<string[]> {
    const params = new URLSearchParams({
      date,
      serviceId,
      ...(barberId && { barberId }),
    });
    
    return apiRequest<string[]>(`/availability?${params}`);
  },

  // Search
  async search(query: string): Promise<{
    services: Service[];
    barbers: Barber[];
    products: Product[];
  }> {
    const params = new URLSearchParams({ q: query });
    return apiRequest<{
      services: Service[];
      barbers: Barber[];
      products: Product[];
    }>(`/search?${params}`);
  },

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getMe(): Promise<User> {
    return apiRequest<User>('/auth/me');
  },

  async logout(): Promise<void> {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
    });
  },
};