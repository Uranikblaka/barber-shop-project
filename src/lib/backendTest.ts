// Simple test for your specific backend API
import { ENV_CONFIG } from '../config/environment';

export async function testBackendServices() {
  try {
    console.log('🧪 Testing your backend services endpoint...');
    console.log(`📍 URL: ${ENV_CONFIG.API_BASE_URL}/services`);
    
    const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/services`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Backend response received:');
    console.log('📊 Response type:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('📊 Data length:', Array.isArray(data) ? data.length : 'N/A');
    console.log('📊 Sample data:', data.slice ? data.slice(0, 2) : data);
    
    return {
      success: true,
      data,
      count: Array.isArray(data) ? data.length : 0,
      type: Array.isArray(data) ? 'array' : typeof data
    };
    
  } catch (error: any) {
    console.error('❌ Backend test failed:', error.message);
    return {
      success: false,
      error: error.message,
      data: null,
      count: 0,
      type: 'error'
    };
  }
}

// Test function you can call from browser console
(window as any).testBackend = testBackendServices;

