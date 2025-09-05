// Mock API client with simulated latency and error handling
import type { Service, Barber, Product, Booking, Order, Customer, Review } from '../types';
import { services } from '../mocks/services';
import { barbers } from '../mocks/barbers';
import { products } from '../mocks/products';
import { bookings } from '../mocks/bookings';
import { orders } from '../mocks/orders';
import { customers } from '../mocks/customers';
import { reviews } from '../mocks/reviews';

const SIMULATED_DELAY = 800;
const ERROR_RATE = 0.05; // 5% chance of error for testing

function simulateNetworkDelay(ms: number = SIMULATED_DELAY): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function maybeThrowError(action: string) {
  if (Math.random() < ERROR_RATE) {
    throw new Error(`Network error during ${action}`);
  }
}

export const apiClient = {
  // Services
  async getServices(): Promise<Service[]> {
    await simulateNetworkDelay();
    maybeThrowError('getServices');
    return services;
  },

  async getService(id: string): Promise<Service | undefined> {
    await simulateNetworkDelay();
    maybeThrowError('getService');
    return services.find(s => s.id === id);
  },

  // Barbers
  async getBarbers(): Promise<Barber[]> {
    await simulateNetworkDelay();
    maybeThrowError('getBarbers');
    return barbers;
  },

  async getBarber(id: string): Promise<Barber | undefined> {
    await simulateNetworkDelay();
    maybeThrowError('getBarber');
    return barbers.find(b => b.id === id);
  },

  // Products
  async getProducts(): Promise<Product[]> {
    await simulateNetworkDelay();
    maybeThrowError('getProducts');
    return products;
  },

  async getProduct(id: string): Promise<Product | undefined> {
    await simulateNetworkDelay();
    maybeThrowError('getProduct');
    return products.find(p => p.id === id);
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    await simulateNetworkDelay();
    maybeThrowError('getBookings');
    return bookings;
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    await simulateNetworkDelay();
    maybeThrowError('createBooking');
    
    const newBooking: Booking = {
      ...booking,
      id: `booking_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    bookings.push(newBooking);
    return newBooking;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    await simulateNetworkDelay();
    maybeThrowError('getOrders');
    return orders;
  },

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    await simulateNetworkDelay();
    maybeThrowError('createOrder');
    
    const newOrder: Order = {
      ...order,
      id: `order_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    return newOrder;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    await simulateNetworkDelay();
    maybeThrowError('getCustomers');
    return customers;
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    await simulateNetworkDelay();
    maybeThrowError('getReviews');
    return reviews;
  },

  // Availability
  async getAvailableSlots(date: string, serviceId: string, barberId?: string): Promise<string[]> {
    await simulateNetworkDelay();
    maybeThrowError('getAvailableSlots');
    
    // Mock available slots for demonstration
    const slots = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Randomly make some slots unavailable
        if (Math.random() > 0.3) {
          slots.push(time);
        }
      }
    }
    
    return slots;
  },

  // Search
  async search(query: string): Promise<{
    services: Service[];
    barbers: Barber[];
    products: Product[];
  }> {
    await simulateNetworkDelay(400);
    maybeThrowError('search');
    
    const lowerQuery = query.toLowerCase();
    
    return {
      services: services.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.category.toLowerCase().includes(lowerQuery)
      ),
      barbers: barbers.filter(b => 
        b.name.toLowerCase().includes(lowerQuery) ||
        b.title.toLowerCase().includes(lowerQuery) ||
        b.specialties.some(spec => spec.toLowerCase().includes(lowerQuery))
      ),
      products: products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.brand.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      ),
    };
  },
};