// Enhanced authFetch - Frontend Only Solution with Auto Organization DB Header, Encryption, and Session Management
const PRODUCTION_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

// Simple retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 8000,  // 8 seconds max
  backoffMultiplier: 2,
  uploadTimeoutMs: 300000, // 5 minutes for uploads
  apiTimeoutMs: 30000      // 30 seconds for regular API calls
};

const ENCRYPTION_KEY = "hB9$kM2#vL8@pR5!nQ7*tY3&wX6+zF4^aS1%dG0~jH9$kM2#vL8@pR5!nQ7*tY3&";

const encryptData = (data) => {
  try {
    // Simple XOR encryption (in production, use proper encryption like AES)
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return btoa(encrypted); // Base64 encode
  } catch (error) {
    console.error('Encryption failed:', error);
    return data; // Fallback to unencrypted
  }
};

const decryptData = (encryptedData) => {
  try {
    const encrypted = atob(encryptedData); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData; // Fallback to return as-is
  }
};

// Global organization configuration
let globalOrgConfig = {
  organizationDB: null,
};

// Function to set the organization DB globally (with encryption)
export const setOrganizationDB = (orgDB) => {
  globalOrgConfig.organizationDB = orgDB;
  // Persist encrypted to both session and localStorage
  if (typeof window !== 'undefined') {
    const encryptedOrgDB = encryptData(orgDB);
    sessionStorage.setItem('organization', encryptedOrgDB);
    console.log(`Organization DB set to: ${orgDB}`);
  }
};

// Function to get the organization DB with session-first logic and decryption
export const getOrganizationDB = () => {
  // Return from memory if available
  if (globalOrgConfig.organizationDB) {
    return globalOrgConfig.organizationDB;
  }
  
  // Try to get from browser storage if not in memory
  if (typeof window !== 'undefined') {
    let encryptedOrgDB = null;
    
    // First try sessionStorage
    encryptedOrgDB = sessionStorage.getItem('organization');
    if (encryptedOrgDB) {
      try {
        const decryptedOrgDB = decryptData(encryptedOrgDB);
        globalOrgConfig.organizationDB = decryptedOrgDB;
        console.log('Organization DB retrieved from sessionStorage');
        return decryptedOrgDB;
      } catch (error) {
        console.error('Failed to decrypt organization DB from sessionStorage:', error);
        // Clear corrupted data
        sessionStorage.removeItem('organization'); 
      }
    }
    
    // If not in sessionStorage, try localStorage
    encryptedOrgDB = localStorage.getItem('organizationName');
    if (encryptedOrgDB) {
      try {
        const decryptedOrgDB = decryptData(encryptedOrgDB);
        globalOrgConfig.organizationDB = decryptedOrgDB;
        // Also set it in sessionStorage for faster access next time
        sessionStorage.setItem('organization', encryptedOrgDB);
        console.log('Organization DB retrieved from localStorage and cached in sessionStorage');
        return decryptedOrgDB;
      } catch (error) {
        console.error('Failed to decrypt organization DB from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('organizationName');
      }
    }
    
    // Fallback: try legacy unencrypted values (for migration)
    const legacySessionOrg = sessionStorage.getItem('organization');
    const legacyLocalOrg = localStorage.getItem('organizationName') || localStorage.getItem('organizationName');
    
    if (legacySessionOrg && !legacySessionOrg.includes('=')) { // Simple check if it's not base64
      console.log('Migrating legacy organization DB from sessionStorage');
      globalOrgConfig.organizationDB = legacySessionOrg;
      // Re-encrypt and store
      setOrganizationDB(legacySessionOrg);
      return legacySessionOrg;
    }
    
    if (legacyLocalOrg && !legacyLocalOrg.includes('=')) { // Simple check if it's not base64
      console.log('Migrating legacy organization DB from localStorage');
      globalOrgConfig.organizationDB = legacyLocalOrg;
      // Re-encrypt and store
      setOrganizationDB(legacyLocalOrg);
      return legacyLocalOrg;
    }
  }
  
  return null;
};

// Function to clear organization DB
export const clearOrganizationDB = () => {
  globalOrgConfig.organizationDB = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('organization');
    localStorage.removeItem('organizationName'); // Clear legacy key too
    console.log('Organization DB cleared from all storage');
  }
};

// ================================
// SESSION EXPIRATION HANDLING
// ================================

// Add this function to handle session expiration specifically
const handleSessionExpiration = (errorData, response) => {
  console.log('🚨 Session expired detected:', errorData);
  
  // Check for the specific SESSION_EXPIRED code from your Flask backend
  if (errorData?.code === 'SESSION_EXPIRED' || 
      errorData?.msg?.includes('Session expired due to inactivity') ||
      errorData?.message?.includes('Session expired due to inactivity')) {
    
    console.log('⏰ Auto-logout due to inactivity - clearing all data');
    
    // Clear all authentication data
    if (typeof window !== 'undefined') {
      // Clear cookies
      document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('user_current_org_id');
      
      // Clear organization DB
      clearOrganizationDB();
      
      // Clear all storage for clean logout
      localStorage.clear();
      sessionStorage.clear();
      
      // Show user-friendly message
      alert('Your session has expired due to inactivity. Please login again.');
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    
    return true; // Indicates session expiration was handled
  }
  
  return false; // Not a session expiration
};

// Connection monitoring
class SimpleConnectionMonitor {
  constructor() {
    this.isOnline = true;
    this.listeners = new Set();

    // Only run in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners('online');
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners('offline');
      });
    }
  }
  
  onStatusChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Connection listener error:', error);
      }
    });
  }
  
  // Simple health check using existing endpoint
  async checkHealth() {
    if (!this.isOnline) return false;
    
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? PRODUCTION_BACKEND_URL 
        : 'http://localhost:5000';
        
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseUrl}/api/check-health/`, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Global connection monitor
let connectionMonitor;
if (typeof window !== 'undefined') {
  connectionMonitor = new SimpleConnectionMonitor();
}

export { connectionMonitor };

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate retry delay
const calculateRetryDelay = (attempt) => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  const jitter = Math.random() * 0.1 * delay;
  return Math.min(delay + jitter, RETRY_CONFIG.maxDelay);
};

// Enhanced session recovery
const attemptSessionRecovery = async () => {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? PRODUCTION_BACKEND_URL 
      : 'http://localhost:5000';
    
    // Try token validation first
    const validateResponse = await fetch(`${baseUrl}/api/validate-token`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (validateResponse.ok) {
      console.log('Session recovered via token validation');
      return true;
    }
    
    // Try explicit refresh
    const refreshResponse = await fetch(`${baseUrl}/api/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (refreshResponse.ok) {
      console.log('Session recovered via token refresh');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Session recovery failed:', error);
    return false;
  }
};

// Enhanced classify errors function with session expiration detection
const classifyError = (error, response) => {
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return { 
      type: 'network', 
      retryable: true, 
      userMessage: 'Connection failed. Please check your internet connection.' 
    };
  }
  
  if (error.name === 'AbortError') {
    return { 
      type: 'timeout', 
      retryable: true, 
      userMessage: 'Request timed out. Please try again.' 
    };
  }
  
  if (response) {
    if (response.status === 401) {
      return { 
        type: 'auth', 
        retryable: false, 
        userMessage: 'Authentication failed. Please login again.',
        isSessionExpired: true // Add this flag
      };
    }
    
    if (response.status === 413) {
      return { 
        type: 'file_too_large', 
        retryable: false, 
        userMessage: 'Recording file is too large. Please try with a shorter recording.' 
      };
    }
    
    if (response.status >= 500) {
      return { 
        type: 'server', 
        retryable: true, 
        userMessage: 'Server temporarily unavailable. Please try again in a moment.' 
      };
    }
    
    if (response.status >= 400) {
      return { 
        type: 'client', 
        retryable: false, 
        userMessage: 'Invalid request. Please check your input and try again.' 
      };
    }
  }
  
  return { 
    type: 'unknown', 
    retryable: false, 
    userMessage: error.message || 'An unexpected error occurred' 
  };
};

/**
 * Enhanced fetch with retry logic and session management - Frontend Only
 */
export async function fetchWithAuth(url, options = {}) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? PRODUCTION_BACKEND_URL
    : 'http://localhost:5000';

  const apiUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  // Determine timeout based on request type
  const isFileUpload = options.body instanceof FormData;
  const timeoutMs = isFileUpload ? RETRY_CONFIG.uploadTimeoutMs : RETRY_CONFIG.apiTimeoutMs;
  
  // Get organization DB with session-first logic and decryption
  const orgDB = getOrganizationDB();

  // Get user email from localStorage if available
  let userEmail = null;
  let orgID = null;
  if (typeof window !== 'undefined') {
    userEmail = localStorage.getItem('userEmail');
    orgID = localStorage.getItem('user_current_org_id')
  }

  console.log("Org ID", orgID);
  
  // Prepare headers with automatic organization DB and user email
  const headers = {
    'Content-Type': 'application/json',
    ...(orgDB && { 'X-Organization-DB': orgDB }),
    ...(userEmail && { 'X-User-Email': userEmail }),
    ...(orgID && { 'X-Organization-ID': orgID }),
    ...options.headers,
  };

  if (isFileUpload) {
    delete headers['Content-Type'];
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors',
  };

  let lastError = null;
  let lastResponse = null;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      // Check if we're online before attempting
      if (!navigator.onLine) {
        throw new Error('Device is offline');
      }
      
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      console.log(`Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}: ${apiUrl}`);
      if (orgDB) {
        console.log(`Using Organization DB: ${orgDB}`);
      }
      
      const response = await fetch(apiUrl, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      lastResponse = response;
      
      // Handle authentication errors with session expiration detection
      if (response.status === 401) {
        // Skip auto-redirect for OTP verification endpoints
        const isOTPEndpoint = url.includes('/verify-otp') || url.includes('/verify-backup-code');
        
        if (!isOTPEndpoint) {
          console.error("Authentication failed - redirecting to login immediately");

          // Try to parse the response to check for session expiration
        try {
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          
          // Check if this is a session expiration
          const isSessionExpired = handleSessionExpiration(errorData, response);
          
          if (isSessionExpired) {
            // Session expiration was handled, throw error to stop retries
            throw new Error('Session expired due to inactivity');
          }
          
        } catch (parseError) {
          console.log('Could not parse 401 response, treating as general auth error');
        }
          
          // Clear any stored tokens and organization DB
          if (typeof window !== 'undefined') {
            document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            clearOrganizationDB();
          }
          
          // Immediate redirect - no retries for auth errors
          window.location.href = '/login';
        }
        
        throw new Error('Authentication failed');
      }
      
      // Return successful responses or client errors (don't retry client errors except 401)
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        if (attempt > 0) {
          console.log(`Request succeeded after ${attempt} retries`);
        }
        return response;
      }
      
      // Server error - will retry
      throw new Error(`Server error: ${response.status}`);
      
    } catch (error) {
      lastError = error;
      const errorInfo = classifyError(error, lastResponse);
      
      console.warn(`Attempt ${attempt + 1} failed:`, {
        url: apiUrl,
        error: errorInfo.userMessage,
        type: errorInfo.type,
        retryable: errorInfo.retryable
      });
      
      // Don't retry non-retryable errors or session expiration
      if (!errorInfo.retryable || errorInfo.isSessionExpired) {
        error.userMessage = errorInfo.userMessage;
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === RETRY_CONFIG.maxRetries) {
        error.userMessage = errorInfo.userMessage;
        throw error;
      }
      
      // Wait before retrying
      const retryDelay = calculateRetryDelay(attempt);
      console.log(`Retrying in ${retryDelay}ms...`);
      await sleep(retryDelay);
    }
  }
  
  // This should never be reached
  if (lastError) {
    throw lastError;
  }
  throw new Error('Max retries exceeded');
}

// Enhanced authFetch - Complete function with duplicate patient error handling
export const authFetch = async (url, options = {}) => {
  try {
    console.log('🚀 authFetch called:', url);
    const response = await fetchWithAuth(url, options);
    
    console.log('📡 Response received:', {
      url,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      console.log('❌ Response not OK, status:', response.status);
      
      let errorMessage = `Request failed with status ${response.status}`;
      let errorData = null;
      
      try {
        // Clone the response before reading it
        const responseClone = response.clone();
        errorData = await responseClone.json();
        console.log('📋 Error data parsed:', errorData);
        
        errorMessage = errorData.error || errorData.message || errorData.msg || errorMessage;
        
        // 🔥 HANDLE SESSION EXPIRATION SPECIFICALLY
        if (response.status === 401) {
          const sessionHandled = handleSessionExpiration(errorData, response);
          
          if (sessionHandled) {
            // Session expiration was handled, create specific error
            const sessionError = new Error("Your session has expired due to inactivity");
            sessionError.name = 'SessionExpiredError';
            sessionError.isSessionExpired = true;
            sessionError.status = 401;
            sessionError.userMessage = "Your session has expired due to inactivity";
            throw sessionError;
          }
        }
        
        // 🎯 HANDLE 402 SUBSCRIPTION REQUIRED
        if (response.status === 402) {
          console.log('🚫 402 DETECTED - Subscription required!');
          console.log('📊 Error data:', errorData);
          
          // Show subscription modal automatically
          showSubscriptionRequiredModal(errorData);
          
          // Create and throw a special subscription error
          const subscriptionError = new Error(errorData.error || "Subscription required to continue");
          subscriptionError.name = 'SubscriptionRequiredError';
          subscriptionError.isSubscriptionError = true;
          subscriptionError.subscription_required = true;
          subscriptionError.status = 402;
          subscriptionError.userMessage = "Please upgrade your subscription to continue";
          subscriptionError.originalData = errorData;
          
          console.log('💥 Throwing subscription error');
          throw subscriptionError;
        }
        
      } catch (parseError) {
        // If the error is our subscription or session error, re-throw it
        if (parseError.isSubscriptionError || parseError.isSessionExpired) {
          throw parseError;
        }
        console.log('❌ Error parsing response JSON:', parseError);
      }
      
      // Handle other HTTP errors (400, 500, etc.) - INCLUDING 409 DUPLICATE PATIENT
      console.log('🔄 Creating error for status:', response.status);
      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = response;

      // 🚨 ADD THIS SECTION: Preserve ALL structured error data
      if (errorData) {
        // Attach all fields from errorData to the error object
        Object.keys(errorData).forEach(key => {
          if (!error.hasOwnProperty(key)) {
            error[key] = errorData[key];
          }
        });
        
        // Specifically ensure important fields are preserved
        if (errorData.error_type) {
          error.error_type = errorData.error_type;
        }
        if (errorData.existing_patient) {
          error.existing_patient = errorData.existing_patient;
        }
        if (errorData.existingPatient) {
          error.existingPatient = errorData.existingPatient;
        }
        if (errorData.duplicate_detected) {
          error.duplicate_detected = errorData.duplicate_detected;
        }
        if (errorData.userMessage) {
          error.userMessage = errorData.userMessage;
        }
        
        // Log what we're preserving for debugging
        console.log('🔍 Preserved structured error data:', {
          error_type: error.error_type,
          existing_patient: error.existing_patient,
          existingPatient: error.existingPatient,
          duplicate_detected: error.duplicate_detected,
          patient_id: error.existing_patient?.id || 'not found'
        });
      }

      if (response.status === 413) {
        error.userMessage = 'File is too large to upload. Please try with a smaller recording.';
      } else if (response.status >= 500) {
        error.userMessage = 'Server is temporarily unavailable. Please try again in a few moments.';
      } else if (response.status === 403) {
        error.userMessage = 'Access denied. Please check your permissions.';
      } else if (response.status === 404) {
        error.userMessage = 'The requested resource was not found.';
      } else if (response.status === 409) {
        // For 409 conflicts (like duplicate patient), preserve the backend message
        error.userMessage = errorMessage;
        console.log('🔍 409 Conflict - preserving backend error message:', errorMessage);
      } else {
        error.userMessage = errorMessage;
      }

      console.log('💥 Throwing error with preserved data:', error);
      throw error;
    }
    
    console.log('✅ Response OK, returning response');
    return response;
  } catch (error) {
    console.log('🚨 authFetch caught error:', error);
    
    // Don't modify subscription or session errors - let them pass through
    if (error.isSubscriptionError || error.isSessionExpired) {
      console.log('🔒 Special error - passing through unchanged');
      throw error;
    }
    
    // Handle network and other errors
    if (!error.userMessage) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        error.userMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.name === 'AbortError') {
        error.userMessage = 'Request timed out. Please try again with a stable connection.';
      } else {
        error.userMessage = error.message;
      }
    }
    
    console.log('🔥 Re-throwing error:', error);
    throw error;
  }
};

// Global subscription modal handler
const showSubscriptionRequiredModal = (errorData) => {
  console.log('🎯 showSubscriptionRequiredModal called with:', errorData);
  
  if (typeof window !== 'undefined') {
    const eventDetail = {
      error: errorData?.error || "Subscription required to continue",
      subscription_required: errorData?.subscription_required || true,
      access_denied: errorData?.access_denied || true,
      trial_expired: errorData?.trial_expired || false,
      originalData: errorData
    };
    
    console.log('📦 Dispatching subscription modal event with detail:', eventDetail);
    
    window.dispatchEvent(new CustomEvent('showSubscriptionModal', { 
      detail: eventDetail
    }));
    
    console.log('✅ showSubscriptionModal event dispatched');
  } else {
    console.log('❌ Window not available for modal event');
  }
};

// Custom error classes for easy identification
export class SubscriptionRequiredError extends Error {
  constructor(message, data = {}) {
    super(message);
    this.name = 'SubscriptionRequiredError';
    this.isSubscriptionError = true;
    this.subscription_required = true;
    this.userMessage = message;
    this.originalData = data;
  }
}

export class SessionExpiredError extends Error {
  constructor(message = "Your session has expired due to inactivity") {
    super(message);
    this.name = 'SessionExpiredError';
    this.isSessionExpired = true;
    this.userMessage = message;
  }
}

// Utility to determine if download should be offered
export const shouldOfferDownload = (error, attemptCount) => {
  const errorInfo = classifyError(error);
  return (
    attemptCount >= RETRY_CONFIG.maxRetries ||
    errorInfo.type === 'network' ||
    errorInfo.type === 'timeout' ||
    errorInfo.type === 'server'
  );
};

// Enhanced clearAuthTokens to also clear organization DB
export const clearAuthTokens = () => {
  if (typeof window !== 'undefined') {
    // Clear cookies
    document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user_current_org_id');
    
    // Clear organization DB
    clearOrganizationDB();
    
    console.log('All auth tokens and organization DB cleared');
  }
};

export default authFetch;