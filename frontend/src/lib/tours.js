// src/lib/tours.js - Complete Database-First Tour System
import introJs from 'intro.js'
import { authFetch } from '@/lib/authFetch'

// User context management
let userContext = {
  email: null,
  isAuthenticated: false
}

// Tour cache - only for current session, NOT persistence
let tourCache = {
  lastChecked: null,
  userTours: {},
  isNewUser: null
}

// Function to set user context
export const setUserContext = (email, isAuth = true) => {
  userContext.email = email
  userContext.isAuthenticated = isAuth
  console.log('📧 User context set:', { email, isAuth })
  
  // Clear cache when user changes
  tourCache = {
    lastChecked: null,
    userTours: {},
    isNewUser: null
  }
}

// Function to get user email
const getUserEmail = () => {
  // Try user context first
  if (userContext.email) {
    return userContext.email
  }
  
  // Try localStorage/sessionStorage
  if (typeof window !== 'undefined') {
    const storedEmail = localStorage.getItem('user_email') || 
                       sessionStorage.getItem('user_email') ||
                       localStorage.getItem('userEmail') ||
                       sessionStorage.getItem('userEmail')
    if (storedEmail) {
      return storedEmail
    }
    
    // Try to extract from any stored user data
    const userData = localStorage.getItem('user_data')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        return parsed.email
      } catch (e) {
        console.warn('Could not parse user_data:', e)
      }
    }
  }
  
  return null
}

// 🎯 DATABASE-FIRST: Check if user should see tour
export const shouldShowTour = async (tourName) => {
  try {
    console.log(`🔍 Checking if should show tour: ${tourName}`)
    
    const userEmail = getUserEmail()
    if (!userEmail) {
      console.log('❌ No user email found - not showing tour')
      return false // Don't show tours if no user context
    }
    
    // Check cache first (only for current session)
    const cacheKey = `${userEmail}_${tourName}`
    if (tourCache.userTours[cacheKey] !== undefined) {
      console.log(`📋 Using cached result for ${tourName}: ${!tourCache.userTours[cacheKey]}`)
      return !tourCache.userTours[cacheKey] // Return opposite of completed
    }
    
    console.log(`🌐 Checking database for tour: ${tourName}`)
    
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Email': userEmail
    }
    
    const response = await authFetch(`/api/should-show-tour/${tourName}`, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
    })
    
    if (!response.ok) {
      console.warn(`❌ Tour API failed with status ${response.status}`)
      // On API failure, don't show tours to avoid annoying existing users
      return false
    }
    
    const data = await response.json()
    console.log(`✅ Database response for ${tourName}:`, data)
    
    if (data.success) {
      // Cache the result for this session
      tourCache.userTours[cacheKey] = !data.should_show // Cache completion status
      tourCache.lastChecked = Date.now()
      
      // SYNC localStorage with database result (backup only)
      if (typeof window !== 'undefined') {
        if (data.should_show) {
          localStorage.removeItem(`tour_completed_${tourName}`)
        } else {
          localStorage.setItem(`tour_completed_${tourName}`, 'true')
        }
      }
      
      console.log(`📊 Database says should_show: ${data.should_show} for ${tourName}`)
      return data.should_show
    }
    
    // If API response is not successful, don't show tour
    console.warn('❌ API returned unsuccessful response - not showing tour')
    return false
    
  } catch (error) {
    console.error(`❌ Error checking tour status for ${tourName}:`, error)
    
    // 🎯 CRITICAL: On error, default to NOT showing tours
    // This prevents tours from showing for existing users when API fails
    console.log(`🚫 API error - defaulting to NOT show tour for safety`)
    return false
  }
}

// 🎯 DATABASE-FIRST: Check if user is truly new
export const isFirstTimeUser = async () => {
  try {
    const userEmail = getUserEmail()
    if (!userEmail) {
      console.log('No user email - treating as not first time user')
      return false // Don't show tours if no user context
    }
    
    // Check cache first
    if (tourCache.isNewUser !== null) {
      console.log(`📋 Using cached new user status: ${tourCache.isNewUser}`)
      return tourCache.isNewUser
    }
    
    console.log('🌐 Checking database for user tour status...')
    
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Email': userEmail
    }
    
    const response = await authFetch('/api/get-tour-status', {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data && data.data.tours) {
        const hasAnyCompletedTours = Object.keys(data.data.tours).length > 0
        const isNew = !hasAnyCompletedTours
        
        // Cache the result
        tourCache.isNewUser = isNew
        
        console.log(`🔍 Database: User has completed tours: ${hasAnyCompletedTours}, isNew: ${isNew}`)
        return isNew
      }
    }
    
    // If API fails, assume user is NOT new (safer approach)
    console.log('❌ API failed - assuming user is NOT new for safety')
    tourCache.isNewUser = false
    return false
    
  } catch (error) {
    console.error('Error checking if first time user:', error)
    // On error, assume NOT new user to avoid showing tours inappropriately
    tourCache.isNewUser = false
    return false
  }
}

// Enhanced markTourAsCompleted - updates both database and cache
const markTourAsCompleted = async (tourName) => {
  try {
    console.log(`Marking tour '${tourName}' as completed`)
    
    const userEmail = getUserEmail()
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (userEmail) {
      headers['X-User-Email'] = userEmail
    }
    
    const response = await authFetch('/api/update-tour-completion', {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({
        tour_name: tourName,
        completed: true
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      console.log(`✅ Tour '${tourName}' marked as completed in database`)
      
      // Update cache to reflect completion
      const cacheKey = `${userEmail}_${tourName}`
      tourCache.userTours[cacheKey] = true // Mark as completed in cache
      
      // Update isNewUser cache if this was their first tour
      if (tourCache.isNewUser === true) {
        tourCache.isNewUser = false
      }
      
      // Optional: Also save to localStorage as backup (but database is primary)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`tour_completed_${tourName}`, 'true')
      }
    } else {
      console.error('Failed to mark tour as completed:', data.error)
      throw new Error(data.error)
    }
    
  } catch (error) {
    console.error(`Error marking tour '${tourName}' as completed:`, error)
    
    // Fallback: only update localStorage if database fails
    if (typeof window !== 'undefined') {
      localStorage.setItem(`tour_completed_${tourName}`, 'true')
      console.log(`Fallback: Saved tour '${tourName}' completion to localStorage only`)
    }
  }
}

// Wait for page and authentication to be ready
const waitForPageReady = async (timeout = 5000) => {
  return new Promise((resolve) => {
    let elapsed = 0
    const interval = 100
    
    const check = () => {
      if (document.readyState === 'complete' && userContext.isAuthenticated) {
        resolve(true)
        return
      }
      
      elapsed += interval
      if (elapsed >= timeout) {
        console.warn('Page ready timeout, proceeding anyway')
        resolve(false)
        return
      }
      
      setTimeout(check, interval)
    }
    
    check()
  })
}

// Enhanced tour starter with database verification
export const startTourWithDelay = async (tourConfig, delay = 2000) => {
  try {
    console.log(`⏳ Starting tour '${tourConfig.name}' with ${delay}ms delay`)
    
    // Wait for page to be ready and user authenticated
    await waitForPageReady()
    
    // Additional delay to ensure all components are mounted
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // 🎯 CRITICAL: Double-check database before showing tour
    if (tourConfig.name) {
      console.log(`🔍 Double-checking database before showing ${tourConfig.name}`)
      const shouldShow = await shouldShowTour(tourConfig.name)
      if (!shouldShow) {
        console.log(`🚫 Database says tour '${tourConfig.name}' should not be shown`)
        return null
      }
      console.log(`✅ Database confirmed: showing tour '${tourConfig.name}'`)
    }
    
    console.log(`🚀 Starting tour: ${tourConfig.name}`)
    return startTour(tourConfig)
    
  } catch (error) {
    console.error(`Error starting delayed tour:`, error)
    return null
  }
}

// Main tour starter function
export const startTour = (tourConfig) => {
  const intro = introJs()
  
  intro.setOptions({
    steps: tourConfig.steps || [],
    nextLabel: tourConfig.options?.nextLabel || 'Next →',
    prevLabel: tourConfig.options?.prevLabel || '← Back',
    doneLabel: tourConfig.options?.doneLabel || 'Done',
    skipLabel: '✕',
    showStepNumbers: tourConfig.options?.showStepNumbers || true,
    showProgress: true,
    exitOnOverlayClick: false,
    exitOnEsc: true,
    nextToDone: true,
    disableInteraction: false,
    scrollToElement: true,
    scrollPadding: 30,
    tooltipPosition: 'auto',
    highlightClass: 'medical-highlight',
    showButtons: true,
    showBullets: false
  })
  
  // Mark tour as completed when finished
  intro.oncomplete(() => {
    console.log(`Tour '${tourConfig.name}' completed`)
    if (tourConfig.name) {
      markTourAsCompleted(tourConfig.name)
    }
  })
  
  // Also mark as completed if skipped
  intro.onexit(() => {
    console.log(`Tour '${tourConfig.name}' exited/skipped`)
    if (tourConfig.name) {
      markTourAsCompleted(tourConfig.name)
    }
  })
  
  intro.start()
  return intro
}

// ===== ALL YOUR EXISTING TOUR CONFIGURATIONS =====

// Clean Patient Page Tour
export const patientPageTour = {
  steps: [
    {
      intro: "👋 Welcome! Let's quickly show you the key features.",
      tooltipClass: 'medical-tour-tooltip'
    },
    {
      element: '[data-tour="search-panel"]',
      intro: "🔍 Find patients by name, date of birth, or Medicare number.",
      position: 'bottom'
    },
    {
      element: '[data-tour="patient-name-input"]',
      intro: "💡 Start typing - you'll see suggestions as you type.",
      position: 'bottom'
    },
    {
      element: '[data-tour="merge-patients-btn"]',
      intro: 'Find and merge duplicate patient records to keep your database clean.',
      position: 'bottom'
    },
    {
      element: '[data-tour="upload-csv-btn"]',
      intro: 'Import multiple patients from a CSV file. Duplicates are automatically detected.',
      position: 'bottom'
    },
    {
      element: '[data-tour="new-patient-btn"]',
      intro: "➕ Add new patients here.",
      position: 'left'
    },
    {
      element: '[data-tour="todays-patients"]',
      intro: "📅 Quick access to today's new patients.",
      position: 'top'
    },
    {
      intro: "✅ You're ready! Click any patient to view their details."
    }
  ],
  options: {
    nextLabel: 'Next →',
    prevLabel: '← Back',
    doneLabel: 'Got it!',
    skipLabel: '✕',
    showStepNumbers: true,
    showProgress: true,
    exitOnOverlayClick: false,
    exitOnEsc: true,
    scrollToElement: true,
    scrollPadding: 30
  }
}

// Clean Recordings Page Tour
export const recordingsPageTour = {
  steps: [
    {
      intro: "🎙️ Welcome to Recordings! Here you can record, upload, and manage patient consultations.",
      tooltipClass: 'medical-tour-tooltip'
    },
    {
      element: '[data-tour="record-button"]',
      intro: "🔴 Click here to start a new recording directly from your browser.",
      position: 'left'
    },
    {
      element: '[data-tour="upload-button"]',
      intro: "📁 Upload existing audio files from your computer.",
      position: 'left'
    },
    {
      element: '[data-tour="recordings-search"]',
      intro: "🔍 Search for recordings by patient name, date of birth, or creation date.",
      position: 'bottom'
    },
    {
      intro: "✨ Once you search, you'll see recordings with playback controls and transcript options!"
    }
  ],
  options: {
    nextLabel: 'Next →',
    prevLabel: '← Back', 
    doneLabel: 'Got it!',
    skipLabel: '✕',
    showStepNumbers: true,
    showProgress: true,
    exitOnOverlayClick: false,
    exitOnEsc: true,
    scrollToElement: true,
    scrollPadding: 30,
    disableInteraction: false
  }
}

// Recording Dialog Tour
export const recordingDialogTour = {
  steps: [
    {
      intro: "🎯 Let's walk through the recording process!",
      tooltipClass: 'medical-tour-tooltip'
    },
    {
      element: '[data-tour="patient-selector"]',
      intro: "👤 First, select the patient you're recording for.",
      position: 'right'
    },
    {
      element: '[data-tour="record-controls"]',
      intro: "🎙️ Use these controls:<br/><br/>🔴 <strong>Red button</strong> - Start/Stop recording<br/>⏸️ <strong>Middle button</strong> - Pause/Resume<br/>⏹️ <strong>Square button</strong> - Stop recording",
      position: 'bottom'
    },
    {
      element: '[data-tour="timer-display"]',
      intro: "⏱️ Your recording time is displayed here.",
      position: 'bottom'
    },
    {
      element: '[data-tour="instructions-panel"]',
      intro: "📋 Follow these step-by-step instructions for best results.",
      position: 'left'
    },
    {
      intro: "🎉 You're ready to record! The system will automatically transcribe and generate letters."
    }
  ],
  options: {
    nextLabel: 'Next →',
    prevLabel: '← Back',
    doneLabel: 'Start Recording!',
    skipLabel: '✕',
    showStepNumbers: true,
    showProgress: true,
    exitOnOverlayClick: false,
    exitOnEsc: true
  }
}

// Letters Page Tour
export const lettersPageTour = {
  steps: [
    {
      intro: "📋 Welcome to Letter Management! Let's explore how to manage your drafts, approvals, and sent letters.",
      tooltipClass: 'medical-tour-tooltip'
    },
    {
      element: '[data-tour="letter-tabs"]',
      intro: "🗂️ These tabs organize your letters by status: Drafts (pending), Approved (ready to send), and Sent (completed).",
      position: 'bottom'
    },
    {
      element: '[data-tour="drafts-tab"]',
      intro: "📝 <strong>My Drafts</strong> - Letters that need review and approval before sending.",
      position: 'bottom'
    },
    {
      element: '[data-tour="approved-tab"]',
      intro: "✅ <strong>Approved Letters</strong> - Letters ready to be sent to doctors or patients.",
      position: 'bottom'
    },
    {
      element: '[data-tour="sent-tab"]',
      intro: "📤 <strong>Sent Letters</strong> - Letters that have been successfully delivered via email.",
      position: 'bottom'
    },
    {
      element: '[data-tour="letter-search"]',
      intro: "🔍 Search for specific letters by patient name or status to quickly find what you need.",
      position: 'bottom'
    },
    {
      element: '[data-tour="letters-table"]',
      intro: "📊 This table shows all your letters with patient details, dates, and available actions.",
      position: 'top'
    },
    {
      element: '[data-tour="view-letter-btn"]',
      intro: "👁️ <strong>View Letter</strong> - Click to read, edit, or approve letters before sending.",
      position: 'top'
    },
    {
      element: '[data-tour="letter-options-menu"]',
      intro: "⚙️ <strong>Options Menu</strong> - Generate patient summaries or consultation reports from existing letters.",
      position: 'left'
    },
    {
      element: '[data-tour="table-pagination"]',
      intro: "📄 Use pagination to navigate through multiple pages of letters when you have many records.",
      position: 'top'
    },
    {
      intro: "🎉 Perfect! You're now ready to efficiently manage all your medical letters. Each tab has specialized actions for that letter type."
    }
  ],
  options: {
    nextLabel: 'Next →',
    prevLabel: '← Back',
    doneLabel: 'Got it!',
    skipLabel: '✕',
    showStepNumbers: true,
    showProgress: true,
    exitOnOverlayClick: false,
    exitOnEsc: true,
    scrollToElement: true,
    scrollPadding: 30
  }
}

// Letters Drafts Tab Tour
export const lettersDraftsTabTour = {
  steps: [
    {
      intro: "📝 You're now viewing your draft letters - letters that need review before sending.",
      tooltipClass: 'medical-tour-tooltip'
    },
    {
      element: '[data-tour="draft-letter-actions"]',
      intro: "🔧 Draft Actions: View and edit letters, generate different report types, and approve when ready.",
      position: 'top'
    },
    {
      element: '[data-tour="view-letter-btn"]',
      intro: "👁️ <strong>View Letter</strong> - Opens the letter editor where you can review, edit, and approve the content.",
      position: 'top'
    },
    {
      element: '[data-tour="letter-options-menu"]',
      intro: "📋 <strong>Generate Options</strong> - Convert letters into Patient Summaries or Consultation Reports for different purposes.",
      position: 'left'
    },
    {
      intro: "✨ New letters from recordings will appear here first, highlighted in green so you don't miss them!"
    }
  ],
  options: {
    nextLabel: 'Next →',
    prevLabel: '← Back',
    doneLabel: 'Perfect!',
    skipLabel: 'Skip',
    showStepNumbers: false,
    showProgress: true,
    scrollToElement: true,
    scrollPadding: 50
  }
}

// Letters Approved Tab Tour
export const lettersApprovedTabTour = {
  steps: [
    {
      intro: "✅ These are your approved letters - ready to be sent to doctors or downloaded.",
      tooltipClass: 'medical-tour-tooltip'
    },
    {
      element: '[data-tour="approved-letter-actions"]',
      intro: "📤 Approved Actions: Send via email, download PDFs, print, or move back to drafts if needed.",
      position: 'top'
    },
    {
      element: '[data-tour="send-letter-btn"]',
      intro: "📧 <strong>Send Letter</strong> - Email the letter directly to the referring doctor with automatic PDF attachment.",
      position: 'top'
    },
    {
      element: '[data-tour="download-letter-btn"]',
      intro: "💾 <strong>Download</strong> - Save a PDF copy to your computer for offline access or manual sending.",
      position: 'top'
    },
    {
      element: '[data-tour="print-letter-btn"]',
      intro: "🖨️ <strong>Print</strong> - Send directly to your printer for physical copies.",
      position: 'top'
    },
    {
      element: '[data-tour="move-to-draft-btn"]',
      intro: "↩️ <strong>Move to Draft</strong> - Return letter to drafts if you need to make additional changes.",
      position: 'top'
    },
    {
      intro: "📋 Approved letters give you maximum flexibility - send digitally, print, or save for later!"
    }
  ],
  options: {
    nextLabel: 'Continue →',
    prevLabel: '← Back',
    doneLabel: 'Excellent!',
    skipLabel: 'Skip',
    showStepNumbers: false,
    showProgress: true
  }
}

// Letters Sent Tab Tour
export const lettersSentTabTour = {
  steps: [
    {
      intro: "📤 Your sent letters - complete record of all delivered correspondence with delivery details.",
      tooltipClass: 'medical-tour-tooltip'
    },
    {
      element: '[data-tour="sent-letter-actions"]',
      intro: "🔄 Sent Actions: View sent letters, resend to additional recipients, or download copies.",
      position: 'top'
    },
    {
      element: '[data-tour="resend-letter-btn"]',
      intro: "🔄 <strong>Re-Send</strong> - Forward the same letter to additional email addresses when needed.",
      position: 'top'
    },
    {
      element: '[data-tour="view-sent-letter-btn"]',
      intro: "👁️ <strong>View Letter</strong> - Review the exact content that was sent, including delivery timestamp.",
      position: 'top'
    },
    {
      intro: "📊 The sent tab serves as your delivery audit trail - perfect for tracking patient communication!"
    }
  ],
  options: {
    nextLabel: 'Next →',
    prevLabel: '← Back',
    doneLabel: 'All done!',
    skipLabel: 'Skip',
    showStepNumbers: false,
    showProgress: true
  }
}

// Quick help tooltips for specific features
export const quickHelp = {
  searchTips: {
    element: '[data-tour="patient-name-input"]',
    intro: "💡 Type a name and select from suggestions for instant access!",
    tooltipClass: 'simple-tip'
  },
  newPatient: {
    element: '[data-tour="new-patient-btn"]',
    intro: "➕ Add patient details and they'll appear in today's list.",
    tooltipClass: 'simple-tip'
  },
  recordingTips: {
    element: '[data-tour="record-button"]',
    intro: "🎙️ Records directly in your browser - no special equipment needed!",
    tooltipClass: 'simple-tip'
  },
  uploadTips: {
    element: '[data-tour="upload-button"]',
    intro: "📁 Supports MP3, WAV, and other common audio formats.",
    tooltipClass: 'simple-tip'
  },
  recordingSearch: {
    element: '[data-tour="recordings-search"]',
    intro: "🔍 Search by patient name, birth date, or when the recording was created.",
    tooltipClass: 'simple-tip'
  }
}

// Letters quick help tooltips
export const lettersQuickHelp = {
  tabNavigation: {
    element: '[data-tour="letter-tabs"]',
    intro: "💡 Click any tab to switch between Draft, Approved, and Sent letters instantly!",
    tooltipClass: 'simple-tip'
  },
  searchLetters: {
    element: '[data-tour="letter-search"]',
    intro: "🔍 Search by patient name, letter type, or status to quickly find specific letters.",
    tooltipClass: 'simple-tip'
  },
  viewLetter: {
    element: '[data-tour="view-letter-btn"]',
    intro: "👁️ View and edit letters before approval. You can modify content and approve when ready.",
    tooltipClass: 'simple-tip'
  },
  sendLetter: {
    element: '[data-tour="send-letter-btn"]',
    intro: "📧 Send approved letters via email with automatic PDF attachment and delivery confirmation.",
    tooltipClass: 'simple-tip'
  },
  letterOptions: {
    element: '[data-tour="letter-options-menu"]',
    intro: "⚙️ Generate Patient Summaries or Consultation Reports from existing letters for different audiences.",
    tooltipClass: 'simple-tip'
  }
}

// ===== HELPER FUNCTIONS =====

// Function to show quick help
export const showQuickHelp = (helpKey) => {
  const helpConfig = quickHelp[helpKey]
  if (!helpConfig) return
  
  const intro = introJs()
  intro.setOptions({
    steps: [{
      element: helpConfig.element,
      intro: helpConfig.intro,
      tooltipClass: 'simple-tip'
    }],
    showStepNumbers: false,
    showProgress: false,
    doneLabel: 'Thanks! 👍',
    skipLabel: '✕',
    exitOnOverlayClick: true,
    exitOnEsc: true,
    showBullets: false
  })
  
  intro.start()
}

// Function to start contextual tours based on active tab
export const startLettersTabTour = (activeTab) => {
  let tourConfig;
  
  switch(activeTab) {
    case 'drafts':
      tourConfig = {
        ...lettersDraftsTabTour,
        name: 'letters_drafts_tab'
      };
      break;
    case 'approved':
      tourConfig = {
        ...lettersApprovedTabTour,
        name: 'letters_approved_tab'
      };
      break;
    case 'sent':
      tourConfig = {
        ...lettersSentTabTour,
        name: 'letters_sent_tab'
      };
      break;
    default:
      return;
  }
  
  startTour(tourConfig);
}

// Function to show letters-specific quick help
export const showLettersQuickHelp = (helpKey) => {
  const helpConfig = lettersQuickHelp[helpKey]
  if (!helpConfig) return
  
  const intro = introJs()
  intro.setOptions({
    steps: [{
      element: helpConfig.element,
      intro: helpConfig.intro,
      tooltipClass: helpConfig.tooltipClass
    }],
    showStepNumbers: false,
    showProgress: false,
    doneLabel: 'Thanks!',
    exitOnOverlayClick: true,
    exitOnEsc: true,
    scrollToElement: true,
    scrollPadding: 20
  })
  
  intro.start()
}

// ===== UTILITY FUNCTIONS =====

// NEW: Function to reset a specific tour (for testing)
export const resetTour = async (tourName) => {
  try {
    console.log(`Resetting tour '${tourName}'`)
    
    const userEmail = getUserEmail()
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (userEmail) {
      headers['X-User-Email'] = userEmail
    }
    
    const response = await authFetch('/api/update-tour-completion', {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({
        tour_name: tourName,
        completed: false
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        console.log(`✅ Tour '${tourName}' reset successfully`)
        
        // Clear from cache
        const cacheKey = `${userEmail}_${tourName}`
        delete tourCache.userTours[cacheKey]
        
        // Also remove from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`tour_completed_${tourName}`)
        }
        return true
      }
    }
    
    throw new Error('Reset failed')
    
  } catch (error) {
    console.error(`Error resetting tour '${tourName}':`, error)
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`tour_completed_${tourName}`)
      console.log(`Fallback: Removed tour '${tourName}' from localStorage`)
    }
    
    return false
  }
}

// Sync tour data function (for login integration)
export const syncTourData = async () => {
  try {
    console.log(`🔄 Syncing tour data from database...`)
    
    // Clear cache to force fresh API calls
    tourCache = {
      lastChecked: null,
      userTours: {},
      isNewUser: null
    }
    
    // Check if user is new
    const isNew = await isFirstTimeUser()
    console.log(`👤 User is new: ${isNew}`)
    
    console.log(`🎉 Tour data sync completed`)
  } catch (error) {
    console.error(`❌ Tour sync failed:`, error)
  }
}

// Test tour system
export const testTourSystem = async () => {
  console.log('🧪 Testing tour system...')
  
  try {
    // Test checking tour status
    const shouldShow = await shouldShowTour('recordings')
    console.log('Should show recordings tour:', shouldShow)
    
    // Test marking tour as completed
    await markTourAsCompleted('test_tour')
    console.log('✅ Test tour marked as completed')
    
    // Test resetting tour
    await resetTour('test_tour')
    console.log('✅ Test tour reset')
    
    console.log('🎉 Tour system test completed successfully')
    return true
    
  } catch (error) {
    console.error('❌ Tour system test failed:', error)
    return false
  }
}

// Function to check API connectivity
export const checkTourAPI = async () => {
  try {
    const response = await authFetch('/api/should-show-tour/test', {
      credentials: 'include'
    })
    
    if (response.ok) {
      console.log('✅ Tour API is reachable')
      return true
    } else {
      console.error('❌ Tour API returned error:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ Tour API is not reachable:', error)
    return false
  }
}

// DEBUGGING: Function to check what's happening with tours
export const debugTourStatus = async (tourName) => {
  console.log(`🔍 DEBUGGING TOUR STATUS FOR: ${tourName}`)
  
  // 1. Check API
  try {
    const userEmail = getUserEmail()
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (userEmail) {
      headers['X-User-Email'] = userEmail
    }
    
    const response = await authFetch(`/api/should-show-tour/${tourName}`, {
      headers: headers,
      credentials: 'include'
    })
    const data = await response.json()
    console.log(`🌐 API Response:`, data)
  } catch (error) {
    console.log(`❌ API Error:`, error)
  }
  
  // 2. Check localStorage
  if (typeof window !== 'undefined') {
    const localStorage_value = localStorage.getItem(`tour_completed_${tourName}`)
    console.log(`💾 localStorage value:`, localStorage_value)
  }
  
  // 3. Check what shouldShowTour returns
  const result = await shouldShowTour(tourName)
  console.log(`🎯 Final shouldShowTour result:`, result)
  
  return result
}

// Export debug functions
export const debugTourSystem = () => {
  console.log('🔍 TOUR SYSTEM DEBUG INFO')
  console.log('User Context:', userContext)
  console.log('User Email:', getUserEmail())
  console.log('Is Authenticated:', userContext.isAuthenticated)
  console.log('Tour Cache:', tourCache)
  
  if (typeof window !== 'undefined') {
    const tourKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('tour_completed_')
    )
    console.log('localStorage Tours (backup only):', tourKeys)
  }
}

// Clear all tour cache (for testing)
export const clearTourCache = () => {
  tourCache = {
    lastChecked: null,
    userTours: {},
    isNewUser: null
  }
  console.log('🗑️ Tour cache cleared')
}

// Legacy function for backward compatibility
export const isNewUser = () => {
  if (typeof window !== 'undefined') {
    const completedTours = Object.keys(localStorage).filter(key => 
      key.startsWith('tour_completed_')
    )
    return completedTours.length === 0
  }
  return true
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.debugTourSystem = debugTourSystem
  window.shouldShowTour = shouldShowTour
  window.setUserContext = setUserContext
  window.syncTourData = syncTourData
  window.clearTourCache = clearTourCache
  window.resetTour = resetTour
  window.debugTourStatus = debugTourStatus
}