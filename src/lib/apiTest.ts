// Comprehensive API testing utilities
import { apiClient } from './api';
import { ENV_CONFIG } from '../config/environment';

export interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'timeout';
  message: string;
  data?: any;
  error?: any;
  duration: number;
}

export class ApiTester {
  private results: ApiTestResult[] = [];

  async testEndpoint<T>(
    name: string,
    endpoint: string,
    testFn: () => Promise<T>
  ): Promise<ApiTestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing ${name}...`);
      const data = await testFn();
      const duration = Date.now() - startTime;
      
      const result: ApiTestResult = {
        endpoint,
        status: 'success',
        message: `✅ ${name} successful`,
        data,
        duration,
      };
      
      this.results.push(result);
      console.log(`✅ ${name} completed in ${duration}ms`);
      return result;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      const result: ApiTestResult = {
        endpoint,
        status: error.name === 'AbortError' ? 'timeout' : 'error',
        message: `❌ ${name} failed: ${error.message}`,
        error,
        duration,
      };
      
      this.results.push(result);
      console.error(`❌ ${name} failed:`, error);
      return result;
    }
  }

  async runAllTests(): Promise<ApiTestResult[]> {
    console.log('🚀 Starting comprehensive API tests...');
    console.log(`📍 Backend URL: ${ENV_CONFIG.API_BASE_URL}`);
    
    this.results = [];

    // Test basic connectivity - try services endpoint since you have that
    await this.testEndpoint('Basic Connectivity', '/services', async () => {
      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/services`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    });

    // Test services endpoints
    await this.testEndpoint('Get All Services', '/services', () => apiClient.getServices());
    
    // Test create service (we'll create a test service)
    await this.testEndpoint('Create Service', '/services', async () => {
      const testService = {
        name: 'Test Service',
        price: 25,
        duration: 30
      };
      return apiClient.createService(testService);
    });
    
    // Test get single service (we'll try to get service with ID 1)
    await this.testEndpoint('Get Service by ID', '/services/1', () => apiClient.getService('1'));
    
    // Test update service (we'll try to update service with ID 1)
    await this.testEndpoint('Update Service', '/services/1', async () => {
      const updateData = {
        name: 'Updated Test Service',
        price: 30,
        duration: 45
      };
      return apiClient.updateService('1', updateData);
    });
    
    // Test delete service (we'll try to delete service with ID 999 - should fail gracefully)
    await this.testEndpoint('Delete Service', '/services/999', () => apiClient.deleteService('999'));
    
    // Test barbers endpoint
    await this.testEndpoint('Barbers', '/barbers', () => apiClient.getBarbers());
    
    // Test products endpoint
    await this.testEndpoint('Products', '/products', () => apiClient.getProducts());
    
    // Test bookings endpoint
    await this.testEndpoint('Bookings', '/bookings', () => apiClient.getBookings());
    
    // Test reviews endpoint
    await this.testEndpoint('Reviews', '/reviews', () => apiClient.getReviews());
    
    // Test customers endpoint
    await this.testEndpoint('Customers', '/customers', () => apiClient.getCustomers());

    // Test search functionality
    await this.testEndpoint('Search', '/search', () => apiClient.search('hair'));

    // Test availability (with sample data)
    await this.testEndpoint('Availability', '/availability', () => 
      apiClient.getAvailableSlots('2024-01-15', 'service-1')
    );

    console.log('🏁 API tests completed');
    return this.results;
  }

  getSummary(): {
    total: number;
    successful: number;
    failed: number;
    timeouts: number;
    averageDuration: number;
  } {
    const total = this.results.length;
    const successful = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'error').length;
    const timeouts = this.results.filter(r => r.status === 'timeout').length;
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    return {
      total,
      successful,
      failed,
      timeouts,
      averageDuration: Math.round(averageDuration),
    };
  }

  getResults(): ApiTestResult[] {
    return [...this.results];
  }
}

// Export a singleton instance
export const apiTester = new ApiTester();
