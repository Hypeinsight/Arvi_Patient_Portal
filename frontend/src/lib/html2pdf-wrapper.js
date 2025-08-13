// html2pdf-wrapper.js
// This file provides a safe wrapper around html2pdf.js for Next.js

let html2pdfLib = null;

// Function to get the html2pdf library, handling SSR scenarios
export const getHtml2Pdf = async () => {
  if (typeof window === 'undefined') {
    // We're in a server environment, return a mock
    return {
      isAvailable: false,
      generate: () => {
        console.error('html2pdf is not available on the server');
        return null;
      }
    };
  }

  // We're in a browser environment
  if (!html2pdfLib) {
    try {
      // Dynamically import the library
      const imported = await import('html2pdf.js');
      html2pdfLib = imported.default || imported;
    } catch (err) {
      console.error('Failed to load html2pdf.js:', err);
      return {
        isAvailable: false,
        generate: () => {
          console.error('html2pdf failed to load');
          return null;
        }
      };
    }
  }

  return {
    isAvailable: true,
    // Return a wrapped version of html2pdf
    generate: async (element, options = {}) => {
      if (!html2pdfLib) return null;
      
      const defaultOptions = {
        margin: [0.5, 0.75, 0.5, 0.75],
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      // Merge options
      const mergedOptions = { ...defaultOptions, ...options };
      
      try {
        return await html2pdfLib().set(mergedOptions).from(element).outputPdf('blob');
      } catch (error) {
        console.error('Error generating PDF:', error);
        return null;
      }
    }
  };
};

// Helper function to strip HTML and convert to plain text
export const stripAllHtml = (htmlContent) => {
  if (!htmlContent) return '';
  
  // First, remove all style and script content
  let plainText = htmlContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Replace common block elements with paragraph breaks
  plainText = plainText
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|table|tr|ul|ol|li|blockquote)[^>]*>/gi, '\n\n')
    .replace(/<br[^>]*>/gi, '\n');
  
  // Now strip all remaining HTML tags
  plainText = plainText.replace(/<[^>]+>/g, '');
  
  // Clean up whitespace
  plainText = plainText
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with just two
    .replace(/ +/g, ' ')        // Replace multiple spaces with a single space
    .trim();                    // Trim whitespace

  return plainText;
};

// Simple PDF blob creation from text (for fallback)
export const createPdfBlob = (text) => {
  // Create a simple PDF blob from text
  // This is a fallback when html2pdf is not available
  
  if (typeof Blob === 'undefined') {
    // Server-side, return null
    return null;
  }
  
  // On client, create a basic blob
  return new Blob([text], { type: 'application/pdf' });
};