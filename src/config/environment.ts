// Environment configuration
export const ENV_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  DEBUG_API: import.meta.env.VITE_DEBUG_API === 'true',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  NODE_ENV: import.meta.env.MODE,
} as const;

// Log configuration in development
if (ENV_CONFIG.DEBUG_API && ENV_CONFIG.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', ENV_CONFIG);
}

