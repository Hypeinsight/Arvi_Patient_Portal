import { useState, useEffect } from 'react';

export function useTrialDays(endDate) {
  const [daysRemaining, setDaysRemaining] = useState(0);
  
  useEffect(() => {
    if (!endDate) return;
    
    // Get today at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get end date at end of day
    const trialEndDate = new Date(endDate);
    trialEndDate.setHours(23, 59, 59, 999);
    
    // Calculate time difference in milliseconds
    const diffTime = trialEndDate.getTime() - today.getTime();
    
    // Convert to days and round up
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Ensure we don't show negative days
    setDaysRemaining(Math.max(0, diffDays));
  }, [endDate]);
  
  return daysRemaining;
}