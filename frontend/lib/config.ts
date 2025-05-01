// Environment variables
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Auth configuration
export const AUTH_CONFIG = {
  cookieName: 'accessToken',
  tokenType: 'Bearer'
} as const;