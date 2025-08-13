import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to combine Tailwind CSS classes
 * @param  {...any} inputs - Class names to combine
 * @returns {String} - Combined class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to dd/mm/yyyy format for display
 * @param {string|Date} dateString - The date string or Date object to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return ""

  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date provided to formatDate:", dateString)
      return "Invalid date"
    }

    // Format as dd/mm/yyyy
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Error"
  }
}

/**
 * Format a date string to YYYY-MM-DD format for input fields
 * @param {string|Date} dateString - The date string or Date object to format
 * @returns {string} Formatted date string for input fields
 */
export function formatDateForInput(dateString) {
  if (!dateString) return "";
  
  try {
    let date;
    if (dateString.includes('/')) {
      // Handle DD/MM/YYYY format specifically
      const parts = dateString.split('/');
      if (parts.length === 3) {
        if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
          // DD/MM/YYYY format - swap day and month
          const [day, month, year] = parts;
          date = new Date(year, month - 1, day);
        } else if (parts[2].length <= 2) {
          // MM/DD/YY format
          const [month, day, year] = parts;
          const fullYear = year.length === 2 ? (parseInt(year) > 50 ? '19' + year : '20' + year) : year;
          date = new Date(fullYear, month - 1, day);
        }
      }
    } else if (dateString.includes('-')) {
      // Handle YYYY-MM-DD format
      date = new Date(dateString);
    } else {
      // Try parsing as-is
      date = new Date(dateString);
    }
    
    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error formatting date for input:', error);
  }
  
  return "";
}



export function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return "Not provided";
  
  // Check if it's already in DD/MM/YYYY format
  if (dateString.includes('/') && dateString.split('/').length === 3) {
    const parts = dateString.split('/');
    if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
      // Already in DD/MM/YYYY format
      return dateString;
    }
  }
  
  try {
    // Parse various date formats
    let date;
    if (dateString.includes('-')) {
      // Handle YYYY-MM-DD format
      if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        date = new Date(dateString);
      } else if (dateString.match(/^\d{2}-\d{2}-\d{4}/)) {
        // DD-MM-YYYY format
        const [day, month, year] = dateString.split('-');
        date = new Date(year, month - 1, day);
      }
    } else if (dateString.includes('/')) {
      // Handle MM/DD/YYYY format
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}/)) {
        const [month, day, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      }
    } else {
      // Try parsing as-is
      date = new Date(dateString);
    }
    
    if (date && !isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error('Error parsing date:', error);
  }
  
  return dateString; // Return original if parsing fails
}

/**
 * Format a date string to include time in DD/MM/YYYY format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(dateString) {
  if (!dateString) return ""

  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

/**
 * Truncate a string to a specified length and add ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length before truncation
 * @returns {string} Truncated string
 */
export function truncateString(str, length = 100) {
  if (!str) return ""
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

/**
 * Helper to create className strings conditionally
 * @param {Object} classes - Object with class names as keys and booleans as values
 * @returns {string} Combined class names for those that are true
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

/**
 * Generate a random ID for components
 * @returns {string} Random ID string
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Format currency values
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Check if running on client or server
 * @returns {boolean} True if running on client
 */
export const isClient = typeof window !== "undefined"

/**
 * Delay execution for a specified time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Default export of all utilities
export default {
  cn,
  formatDate,
  formatDateForInput,
  formatDateTime,
  truncateString,
  classNames,
  generateId,
  formatCurrency,
  isClient,
  delay,
}