// Base price per user
const BASE_PRICE = 40.00 // AUD

/**
 * Calculate subscription price with tier-based discounts
 * 1-4 users: No discount (40 AUD per user)
 * 5-9 users: 20% discount on total amount
 * 10+ users: 28% discount on total amount
 * 
 * @param {number} userCount - Number of users
 * @returns {Object} - Price details including unit price, total, and discount info
 */
export function calculateSubscriptionPrice(userCount) {
  let discountPercentage = 0
  let unitPrice = BASE_PRICE
  
  // Calculate initial total price (before discount)
  let totalPrice = unitPrice * userCount
  
  // Apply tier-based discounts to the total amount
  if (userCount >= 10) {
    discountPercentage = 30
    totalPrice = totalPrice * (1 - discountPercentage / 100)
  } else if (userCount >= 5) {
    discountPercentage = 20
    totalPrice = totalPrice * (1 - discountPercentage / 100)
  }
  
  // Calculate effective unit price after discount
  const effectiveUnitPrice = userCount > 0 ? totalPrice / userCount : 0
  
  return {
    userCount,
    basePrice: BASE_PRICE,
    unitPrice: parseFloat(effectiveUnitPrice.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    discountPercentage,
    currency: 'AUD',
    discountedAmount: parseFloat((BASE_PRICE * userCount - totalPrice).toFixed(2))
  }
}

/**
 * Calculate prorated charges when upgrading/downgrading mid-cycle
 * 
 * @param {number} currentUserCount - Current number of users
 * @param {number} newUserCount - New number of users
 * @param {number} daysRemaining - Days remaining in billing cycle
 * @param {number} totalDaysInCycle - Total days in billing cycle (usually 30)
 * @returns {Object} - Prorated charge details
 */
export function calculateProratedCharge(currentUserCount, newUserCount, daysRemaining, totalDaysInCycle = 30) {
  const currentPrice = calculateSubscriptionPrice(currentUserCount)
  const newPrice = calculateSubscriptionPrice(newUserCount)
  
  // Calculate daily rate for both current and new subscription
  const currentDailyRate = currentPrice.totalPrice / totalDaysInCycle
  const newDailyRate = newPrice.totalPrice / totalDaysInCycle
  
  // Calculate prorated charge
  const proratedCharge = (newDailyRate - currentDailyRate) * daysRemaining
  
  return {
    currentPrice: currentPrice.totalPrice,
    newPrice: newPrice.totalPrice,
    proratedCharge: parseFloat(proratedCharge.toFixed(2)),
    daysRemaining,
    totalDaysInCycle,
    immediateCharge: proratedCharge > 0 ? parseFloat(proratedCharge.toFixed(2)) : 0,
    isRefund: proratedCharge < 0,
    refundAmount: proratedCharge < 0 ? parseFloat(Math.abs(proratedCharge).toFixed(2)) : 0,
    currency: 'AUD'
  }
}

/**
 * Calculate cost for adding a new seat mid-cycle
 * 
 * @param {number} currentUserCount - Current number of users
 * @param {number} seatsToAdd - Number of seats to add
 * @param {number} daysRemaining - Days remaining in billing cycle
 * @param {number} totalDaysInCycle - Total days in billing cycle (usually 30)
 * @returns {Object} - New seat charge details
 */
export function calculateNewSeatCharge(currentUserCount, seatsToAdd = 1, daysRemaining, totalDaysInCycle = 30) {
  const newUserCount = currentUserCount + seatsToAdd;
  const currentPricing = calculateSubscriptionPrice(currentUserCount);
  const newPricing = calculateSubscriptionPrice(newUserCount);
  
  // Calculate per-seat charge (this will be the effective rate after discounts)
  const perSeatPerMonthCharge = BASE_PRICE;
  
  // Calculate prorated amount for remaining days
  const proration = daysRemaining / totalDaysInCycle;
  const proratedPerSeatCharge = perSeatPerMonthCharge * proration;
  
  // Calculate total charge for the new seats, accounting for potential tier change discount
  const totalNewSeatCharge = newPricing.totalPrice - currentPricing.totalPrice;
  
  return {
    currentUserCount,
    newUserCount,
    seatsToAdd,
    perSeatMonthlyCharge: perSeatPerMonthCharge,
    proratedPerSeatCharge: parseFloat(proratedPerSeatCharge.toFixed(2)),
    totalNewSeatCharge: parseFloat(totalNewSeatCharge.toFixed(2)),
    daysRemaining,
    totalDaysInCycle,
    proration: parseFloat((proration * 100).toFixed(1)),
    currentMonthlyTotal: currentPricing.totalPrice,
    newMonthlyTotal: newPricing.totalPrice,
    currency: 'AUD',
    nextBillingAmount: newPricing.totalPrice
  }
}

/**
 * Format currency amount for display
 * 
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: AUD)
 * @returns {string} - Formatted currency string
 */
// In your formatCurrency helper function
export function formatCurrency(amount) {
  // Check if the amount is already in dollars or needs conversion
  const dollars = amount > 1000 ? amount / 100 : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2
  }).format(dollars);
}

// In lib/subscriptionService.js
export function calculateDaysRemaining(endDate) {
  // Convert to date object if it's a string
  const trialEndDate = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Get current date without time component
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Clone the end date and set to end of day to include the full end date
  const endOfTrialDay = new Date(trialEndDate);
  endOfTrialDay.setHours(23, 59, 59, 999);
  
  // Calculate the time difference in milliseconds
  const timeDiff = endOfTrialDay.getTime() - today.getTime();
  
  // Convert to days (rounded up to include partial days)
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  // Return the calculated days, or 0 if negative
  return Math.max(0, daysRemaining);
}

/**
 * Format date for display
 * 
 * @param {string} dateStr - Date string in ISO format
 * @returns {string} - Formatted date string (e.g., "August 15, 2023")
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date)
}

/**
 * Calculate the next billing date given a start date and billing cycle
 * 
 * @param {Date|string} startDate - Start date or ISO string
 * @param {number} billingCycle - Billing cycle in days (default: 30)
 * @returns {Date} - Next billing date
 */
export function calculateNextBillingDate(startDate, billingCycle = 30) {
  const date = startDate instanceof Date ? new Date(startDate) : new Date(startDate);
  date.setDate(date.getDate() + billingCycle);
  return date;
}

/**
 * Format date for user-friendly display in MM/DD/YYYY format
 * 
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatShortDate(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

/**
 * Check if a date is in the past
 * 
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
export function isDateInPast(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  return dateObj < now;
} 