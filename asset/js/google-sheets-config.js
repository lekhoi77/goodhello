/**
 * Google Sheets Configuration
 * 
 * Setup Instructions:
 * 1. Create a Google Sheet with these columns:
 *    A: host (e.g., "phatla", "john", "mary")
 *    B: guestName (name of the person visiting)
 *    C: message (their wish/message, can be empty)
 *    D: timestamp (auto-generated)
 * 
 * 2. In Google Sheets, go to Extensions > Apps Script
 * 3. Copy the code from google-apps-script.js (see instructions below)
 * 4. Deploy as Web App (Manage Deployments > New Deployment > Web App)
 * 5. Set "Execute as: Me" and "Who has access: Anyone"
 * 6. Copy the Web App URL and paste it below
 */

const GOOGLE_SHEETS_CONFIG = {
    // Your Google Apps Script Web App URL
    // Format: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
    webAppUrl: 'https://script.google.com/macros/s/AKfycbwYFidWreUFr4sbbjO32osWNm90An3IfuuCfbKcT_ZVGeSdRDSyYIOB2F_cSSqhpe7YAQ/exec',
    
    // Optional: Your Google Sheet ID (for reference only)
    sheetId: 'YOUR_SHEET_ID_HERE',
    
    // Cache duration in milliseconds (5 minutes)
    cacheDuration: 5 * 60 * 1000,
    
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000
};

// Export for use in other files
window.GOOGLE_SHEETS_CONFIG = GOOGLE_SHEETS_CONFIG;
