/**
 * Configuration settings for the application
 */

// API URL - Change this based on environment
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Default timeout for API requests (in milliseconds)
export const API_TIMEOUT = 30000;

// Feature flags
export const FEATURES = {
  ENABLE_SUBSCRIPTION: true,
  ENABLE_TEAM_MANAGEMENT: true,
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
};

// Stripe public key
export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY || '';

// App metadata
export const APP_METADATA = {
  NAME: 'Healthhype',
  VERSION: '1.0.0',
  DESCRIPTION: 'Healthcare management platform',
  SUPPORT_EMAIL: 'support@healthhype.com',
};

// Auth settings
export const AUTH = {
  TOKEN_STORAGE_KEY: 'token',
  REFRESH_TOKEN_STORAGE_KEY: 'refreshToken',
  TOKEN_EXPIRY_KEY: 'tokenExpiry',
}; 