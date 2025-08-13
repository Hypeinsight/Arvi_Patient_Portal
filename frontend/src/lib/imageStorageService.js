// Service functions for handling image uploads to GCP

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Upload a doctor's signature to GCP bucket
 * @param {number} doctorId - The doctor's ID
 * @param {File} file - The signature image file
 * @returns {Promise} - Response with URL to the uploaded signature
 */
export const uploadDoctorSignatureToGCP = async (doctorId, file) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('signature', file);
    
    // Make API call to upload signature
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/${doctorId}/signature`, 
      {
        method: 'POST',
        // Don't set Content-Type when sending FormData - browser will set it automatically with boundary
        body: formData
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading doctor signature:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload signature'
    };
  }
};

/**
 * Upload organization logo to GCP bucket
 * @param {File} file - The logo image file
 * @returns {Promise} - Response with URL to the uploaded logo
 */
export async function uploadOrganizationLogoToGCP(file) {
  const formData = new FormData();
  formData.append('logo', file);
  
  try {
    const response = await fetch(`${API_URL}/api/organization/logo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Error uploading logo: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading organization logo:', error);
    throw error;
  }
}

/**
 * Get a doctor's signature URL with cache-busting
 * @param {number} doctorId - The doctor's ID
 * @returns {string} - The signed URL for the signature
 */
export function getDoctorSignatureUrl(doctorId) {
  const timestamp = new Date().getTime();
  return `${API_URL}/api/doctor/${doctorId}/signature?t=${timestamp}`;
}

/**
 * Get organization logo URL with cache-busting
 * @returns {string} - The signed URL for the logo
 */
export function getOrganizationLogoUrl() {
  const timestamp = new Date().getTime();
  return `${API_URL}/api/organization/logo?t=${timestamp}`;
}