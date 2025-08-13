// API client functions for packages and seat management

/**
 * Fetch package options for a given seat count
 * @param {number} seatCount - Number of seats
 * @returns {Promise<Object>} - Package options
 */
export async function fetchPackageOptions(seatCount) {
    try {
      const response = await fetch(`/api/packages?seats=${seatCount}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching package options:', error);
      return { success: false, error: 'Failed to fetch package options' };
    }
  }
  
  /**
   * Update subscription seats
   * @param {number} seatCount - New seat count
   * @param {Object} selectedPackage - Selected package option
   * @returns {Promise<Object>} - Response from server
   */
  export async function updateSubscriptionSeats(seatCount, selectedPackage) {
    try {
      // Prepare request payload based on package type
      const payload = {
        seat_count: seatCount,
        package_type: selectedPackage.type
      };
      
      // Add package-specific details
      if (selectedPackage.type === 'standard') {
        payload.price_id = selectedPackage.price_id;
      } else {
        payload.base_price_id = selectedPackage.base_price_id;
        payload.additional_seat_price_id = selectedPackage.additional_seat_price_id;
        payload.additional_seats = selectedPackage.additional_seats;
      }
      
      const response = await fetch('/api/subscriptions/update-seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating subscription seats:', error);
      return { success: false, error: 'Failed to update subscription seats' };
    }
  }