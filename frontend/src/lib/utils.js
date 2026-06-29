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

// export function parseOcrText(text) {
//   if (!text) return {}

//   const get = (pattern) => {
//     const match = text.match(pattern)
//     return match ? match[1].trim() : ""
//   }

//   return {
//     firstName:              get(/First\s*Name[:\s]+([A-Za-z]+)/i),
//     lastName:               get(/(?:Last|Sur)\s*Name[:\s]+([A-Za-z]+)/i),
//     dateOfBirth:            get(/(?:DOB|Date\s*of\s*Birth)[:\s]+([\d\/\-]+)/i),
//     gender:                 get(/Gender[:\s]+(Male|Female|Other)/i),
//     phoneNumber:            get(/(?:Phone|Mobile|Tel)[:\s]+([\+\d\s\-()]+)/i),
//     emailAddress:           get(/Email[:\s]+([\w.\-]+@[\w.\-]+\.[a-z]{2,})/i),
//     homeAddress:            get(/(?:Address|Home)[:\s]+(.+)/i),
//     emergencyContactName:   get(/Emergency\s*Contact\s*Name[:\s]+([A-Za-z\s]+)/i),
//     emergencyContactNumber: get(/Emergency\s*Contact\s*(?:Number|Phone)[:\s]+([\+\d\s]+)/i),
//   }
// }

export function parseOcrText(text) {
  if (!text) return {};

  let lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let firstName = "";
  let lastName = "";
  let dateOfBirth = "";
  let homeAddress = "";

  // 1. EXTRACT & STRIP DATES FIRST
  const dateRegex = /\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/g;
  const rawText = lines.join(" ");
  const datesFound = [];
  let match;

  while ((match = dateRegex.exec(rawText)) !== null) {
    const [fullDate, day, month, year] = match;
    datesFound.push({
      raw: fullDate,
      iso: `${year}-${month}-${day}`,
      year: parseInt(year, 10)
    });
  }

  if (datesFound.length > 0) {
    datesFound.sort((a, b) => a.year - b.year);
    dateOfBirth = datesFound[0].iso;

    lines = lines.map(line => {
      let cleanLine = line;
      datesFound.forEach(d => {
        cleanLine = cleanLine.replace(d.raw, "");
      });
      return cleanLine.replace(/\\|\s+/g, " ").trim();
    }).filter(line => line.length > 0);
  }

  // 2. DEFINE SYSTEM WORD BLOCKLIST
  const strictlyNotNames = [
    "licence", "license", "driver", "drivers", "card", "permit", "identification", "id",
    "australia", "victoria", "queensland", "tasmania", "nsw", "vic", "qld", "tas", "act", "nt", "wa",
    "south", "wales", "northern", "territory", "western", 
    "class", "expiry", "expires", "date", "issue", "issued", "success", "text", "customer", 
    "status", "number", "no", "type", "conditions", "donor", "address", "signature", "flat", "level"
  ];

  // 3. CLEAN ARTIFACTS AND EXTRACT NAMES
  const candidateNameLines = lines
    .map(line => {
      // Clean out common OCR trailing inline document numbers and noise characters
      // e.g., "JANE CITIZEN \u201c987054321" -> "JANE CITIZEN"
      let clean = line.replace(/[\d\u201c\u201d\u2018\u2019\"'<>\\\/\|}\[]/g, "").trim();
      return clean;
    })
    .filter(line => {
      if (line.length < 3) return false;

      const lowerLine = line.toLowerCase();
      const hasBlocklistWord = strictlyNotNames.some(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(lowerLine);
      });

      return !hasBlocklistWord;
    });

  if (candidateNameLines.length > 0) {
    const firstLineParts = candidateNameLines[0]
      .split(/\s+/)
      .filter(p => /^[A-Za-z\-]+$/.test(p));
    
    if (firstLineParts.length >= 2) {
      firstName = firstLineParts[0];
      lastName = firstLineParts.slice(1).join(" ");
    } else if (firstLineParts.length === 1 && candidateNameLines[1]) {
      firstName = firstLineParts[0];
      const secondLineParts = candidateNameLines[1]
        .split(/\s+/)
        .filter(p => /^[A-Za-z\-]+$/.test(p));
      if (secondLineParts.length > 0) {
        lastName = secondLineParts.join(" ");
      }
    }
  }

  // 4. EXTRACT ADDRESS
  const addressRoadRegex = /\b(ST|STREET|ROAD|RD|AVE|AVENUE|DR|DRIVE|CT|COURT|PL|PLACE|HIGHWAY|HWY|VIC|NSW|QLD|SA|WA|TAS|ACT|NT|FLAT|UNIT)\b/i;
  const postcodeRegex = /\b[0-9]{4}\b/;

  const addressLines = lines.filter(line => {
    const cleanLine = line.toLowerCase();
    const isAlreadyParsedName = (firstName && cleanLine.includes(firstName.toLowerCase())) || 
                                (lastName && cleanLine.includes(lastName.toLowerCase()));
    
    return (addressRoadRegex.test(line) || postcodeRegex.test(line)) && !isAlreadyParsedName;
  });

  if (addressLines.length > 0) {
    homeAddress = addressLines.join(" ").replace(/\s+/g, " ").trim();
    // Quick layout fix for loose symbols leftover in addresses
    homeAddress = homeAddress.replace(/[\\\/\|>}\[\]\u201c\u201d]/g, "").replace(/\s+/g, " ").trim();
  }

  const formatCasing = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  return {
    firstName: firstName.split(" ").map(formatCasing).join(" "),
    lastName: lastName.split(" ").map(formatCasing).join(" "),
    dateOfBirth,
    gender: "Male", 
    phoneNumber: "",
    emailAddress: "",
    homeAddress,
    emergencyContactName: "",
    emergencyContactNumber: "",
  };
}

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
  parseOcrText,
}