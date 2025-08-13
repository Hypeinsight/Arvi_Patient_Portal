// lib/htmlToPdf.js
/**
 * HTML to PDF conversion utilities for the letter system
 */

/**
 * Convert HTML to PDF using dynamic library loading
 * @param {HTMLElement} element - The HTML element to convert
 * @returns {Promise<Blob|null>} - PDF as a Blob or null if failed
 */
export async function convertHtmlToPdf(element) {
  if (!element) {
    console.error("No HTML element provided for PDF conversion");
    return null;
  }
  
  try {
    // First try to dynamically load html2canvas and jsPDF if not already available
    await loadDependencies();
    
    // Create a temporary container for the letter content
    const container = document.createElement('div');
    container.style.width = '8.5in';
    container.style.padding = '0.5in';
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    
    // Clone the letter content
    const contentClone = element.cloneNode(true);
    
    // Remove any buttons or interactive elements
    const elementsToRemove = contentClone.querySelectorAll('button, .no-print, script, style');
    elementsToRemove.forEach(el => el.remove());
    
    // Add to the container
    container.appendChild(contentClone);
    
    // Add to DOM temporarily but hide it
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    
    // Generate PDF
    let pdfBlob = null;
    
    try {
      // Create a canvas from the HTML
      const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      // Convert the canvas to an image
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Create a new PDF document
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'pt', 'letter');
      
      // PDF dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate the scaling factor to fit the content on the page
      const widthRatio = pageWidth / canvas.width;
      const heightRatio = pageHeight / canvas.height;
      const ratio = Math.min(widthRatio, heightRatio);
      
      // Calculate centered position
      const xOffset = (pageWidth - canvas.width * ratio) / 2;
      const yOffset = 30; // Small top margin
      
      // Add the image to the PDF
      pdf.addImage(
        imgData, 'JPEG', 
        xOffset, yOffset, 
        canvas.width * ratio, canvas.height * ratio
      );
      
      // Convert the PDF to a blob
      pdfBlob = pdf.output('blob');
    } catch (pdfError) {
      console.error("Error generating PDF from canvas:", pdfError);
      pdfBlob = await createTextPdfFallback(contentClone.innerText || contentClone.textContent);
    }
    
    // Clean up the temporary container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    
    return pdfBlob;
  } catch (error) {
    console.error("Error in convertHtmlToPdf:", error);
    return null;
  }
}

/**
 * Create a simple text-based PDF as fallback
 * @param {string} text - The text content
 * @returns {Promise<Blob|null>} - PDF as a Blob or null if failed
 */
export async function createTextPdfFallback(text) {
  try {
    await loadDependencies();
    
    // Create a new PDF document
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'letter');
    
    // Set font
    pdf.setFont('Helvetica');
    pdf.setFontSize(11);
    
    // Margins
    const margins = {
      top: 72,
      bottom: 72,
      left: 72,
      right: 72
    };
    
    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margins.left - margins.right;
    
    // Add date
    const date = new Date().toLocaleDateString();
    pdf.text(date, margins.left, margins.top);
    
    // Add salutation
    let yPos = margins.top + 40;
    pdf.text('Dear Referring Doctor,', margins.left, yPos);
    yPos += 30;
    
    // Add content with word wrapping
    const lines = pdf.splitTextToSize(text, contentWidth);
    
    // Add each line
    for (let i = 0; i < lines.length; i++) {
      pdf.text(lines[i], margins.left, yPos);
      yPos += 15;
      
      // Check if we need a new page
      if (yPos > pdf.internal.pageSize.getHeight() - margins.bottom) {
        pdf.addPage();
        yPos = margins.top;
      }
    }
    
    // Add signature
    yPos += 20;
    pdf.text('Yours Sincerely,', margins.left, yPos);
    yPos += 40;
    pdf.text('Electronically Signed', margins.left, yPos);
    
    // Convert to blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error("Error generating fallback PDF:", error);
    return null;
  }
}

/**
 * Load html2canvas and jsPDF libraries if not already available
 */
async function loadDependencies() {
  // Load html2canvas if not available
  if (typeof html2canvas === 'undefined') {
    console.log("Loading html2canvas dynamically");
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Load jsPDF if not available
  if (typeof window.jspdf === 'undefined') {
    console.log("Loading jsPDF dynamically");
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}