import { authFetch } from '@/lib/authFetch'
import { API_URL } from '../config'

/**
 * Get trial status information
 */
export async function getTrialStatus() {
  try {
    console.log('Fetching trial status from:', `${API_URL}/api/trial/status`)
    let token = ''
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || ''
    }

    const response = await authFetch(`${API_URL}/api/trial/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Trial status error:', errorData)
      
      if (response.status === 404) {
        console.log('No trial found - backend should auto-create one on next request')
        return await retryTrialStatusRequest()
      }
      
      throw new Error(errorData.error || 'Failed to fetch trial status')
    }
    
    const data = await response.json()
    console.log('Trial status data:', data)
    return data
  } catch (error) {
    console.error('Error fetching trial status:', error)
    throw error
  }
}

/**
 * Helper function to retry trial status request
 */
async function retryTrialStatusRequest() {
  try {
    console.log('Retrying trial status request after potential auto-creation')
    let token = ''
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || ''
    }

    const response = await authFetch(`${API_URL}/api/trial/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Retry error:', errorData)
      throw new Error(errorData.error || 'Failed to fetch trial status after retry')
    }
    
    const data = await response.json()
    console.log('Retry data:', data)
    return data
  } catch (error) {
    console.error('Error retrying trial status:', error)
    return {
      success: true,
      trial: {
        status: 'active',
        days_remaining: 14,
        is_expired: false,
        access_restricted: false,
        has_subscription: false
      }
    }
  }
}

/**
 * SIMPLIFIED: Get subscription details for solo package only
 */
export async function getSubscriptionDetails() {
  try {
    console.log('Fetching subscription details from:', `${API_URL}/api/subscriptions`)
    let token = ''
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || ''
    }

    const response = await authFetch(`${API_URL}/api/subscriptions`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Subscription details error:', errorData)
      throw new Error(errorData.error || 'Failed to fetch subscription details')
    }
    
    const data = await response.json()
    console.log('Subscription details data:', data)
    
    // SIMPLIFIED: Always solo package
    if (data.success && data.subscription) {
      data.subscription.package_type = 'solo';
      data.subscription.package_name = 'Individual';
    }
    
    return data
  } catch (error) {
    console.error('Error fetching subscription details:', error)
    throw error
  }
}

/**
 * SIMPLIFIED: Cancel subscription
 */
export async function cancelSubscription(reason = null, cancelImmediately = false) {
  try {
    const token = localStorage.getItem('token') || '';
    
    const response = await authFetch(`${API_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ 
        reason,
        cancel_immediately: cancelImmediately
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * SIMPLIFIED: Reactivate subscription
 */
export async function reactivateSubscription() {
  try {
    const token = localStorage.getItem('token') || '';
    
    const response = await authFetch(`${API_URL}/api/subscriptions/reactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reactivate subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
}

/**
 * SIMPLIFIED: Convert trial to solo subscription
 */
export async function convertTrialToSubscription() {
  try {
    console.log("Converting trial to solo subscription");
    
    // Get current trial status for consistent data
    const trialStatus = await getTrialStatus();
    const daysRemaining = trialStatus?.trial?.days_remaining || 0;
    
    console.log("Current trial days remaining:", daysRemaining);
    
    const token = localStorage.getItem('token') || '';
    
    const payload = { 
      plan_name: 'solo',  // Always solo
      quantity: 1,        // Always 1 for solo
      trial_days_remaining: daysRemaining,
      success_url: `${window.location.origin}/settings/billing/success`,
      cancel_url: `${window.location.origin}/settings?tab=billing&status=canceled`
    };
    
    const response = await authFetch(`${API_URL}/api/subscriptions/convert-trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to convert trial');
    }
    
    const data = await response.json();
    
    if (data.trial_days && data.trial_days !== daysRemaining) {
      console.log(`Server calculated ${data.trial_days} days (we had ${daysRemaining})`);
    }
    
    return data;
  } catch (error) {
    console.error('Error converting trial to subscription:', error);
    throw error;
  }
}

/**
 * SIMPLIFIED: Create a checkout session for solo subscription
 */
export async function createSubscriptionCheckout(isTrialConversion = false) {
  try {
    console.log('Creating solo subscription checkout, trial conversion:', isTrialConversion);
    
    const response = await authFetch(`${API_URL}/api/subscriptions/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_name: 'solo',     // Always solo
        quantity: 1,           // Always 1 for solo
        trial_conversion: isTrialConversion,
        success_url: `${window.location.origin}/settings/billing/success`,
        cancel_url: `${window.location.origin}/settings?tab=billing&status=canceled`
      })
    });

    console.log('Checkout response status:', response.status);
    
    const data = await response.json();
    console.log('Checkout response:', data);
    
    if (data.success) {
      // Handle checkout URL response
      if (data.checkout_url) {
        console.log('Redirecting to Stripe checkout:', data.checkout_url);
        window.location.href = data.checkout_url;
        return data;
      }
      
      return data;
    } else {
      console.error('Checkout failed:', data);
      throw new Error(data.error || 'Failed to create checkout');
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
}

/**
 * SIMPLIFIED: Get team members count (for solo package display)
 */
export async function getTeamMembers() {
  try {
    const response = await authFetch(`${API_URL}/api/team-members`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch team members');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}

/**
 * SIMPLIFIED: Get subscription info
 */
export async function getSubscriptionInfo() {
  try {
    console.log('Fetching subscription info data');
    const response = await authFetch(`${API_URL}/api/subscription-info`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Subscription info error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch subscription information');
    }
    
    const data = await response.json();
    console.log('Subscription info data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching subscription information:', error);
    throw error;
  }
}

/**
 * Handle Stripe redirect success
 */
export function StripeRedirectHandler({ onSuccess }) {
  const router = useRouter();
  const { status } = router.query;
  
  useEffect(() => {
    if (status === 'success') {
      console.log('Detected successful Stripe redirect');
      
      const currentUrl = new URL(window.location.href);
      const tabParam = currentUrl.searchParams.get('tab');
      
      let cleanUrl = window.location.pathname;
      if (tabParam) {
        cleanUrl += `?tab=${tabParam}`;
      }
      
      window.history.replaceState({}, document.title, cleanUrl);
      
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    }
  }, [status, onSuccess, router]);
  
  return null;
}

// REMOVED: All multi-package functions since you only need solo
// - createPackageCheckout
// - upgradeSubscriptionPackage
// - updateSubscriptionQuantity
// - createAddSeatsCheckout
// - getAvailablePackages
// - etc.

// Legacy compatibility - redirect to simplified functions
export async function createSubscription() {
  return createSubscriptionCheckout(false);
}

export async function getPaymentMethods() {
  // SIMPLIFIED: Return empty for solo package (payment collected during checkout)
  return {
    success: true,
    payment_methods: []
  };
}