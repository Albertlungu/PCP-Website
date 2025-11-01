// Google Apps Script for PCP Website Performance Signups
// This script receives form submissions and writes them to Google Sheets

// Replace with your actual Google Sheets ID
const SPREADSHEET_ID = '1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68';
const SHEET_NAME = 'Performance Schedule';

function doGet(e) {
  try {
    const action = e.parameter.action;
    const callback = e.parameter.callback; // JSONP callback name (optional)

    if (action === 'getAvailableDates') {
      const payload = getAvailableDatesPayload();

      // If callback provided, return JSONP (application/javascript)
      if (callback) {
        const jsonp = `${callback}(${JSON.stringify(payload)})`;
        return ContentService
          .createTextOutput(jsonp)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }

      // Otherwise return normal JSON with CORS headers
      return ContentService
        .createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    const errorPayload = { success: false, message: 'Invalid action parameter' };
    return ContentService
      .createTextOutput(JSON.stringify(errorPayload))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');

  } catch (error) {
    Logger.log('Error in doGet: ' + error.message);
    const errorPayload = { success: false, message: 'An error occurred while fetching data' };
    return ContentService
      .createTextOutput(JSON.stringify(errorPayload))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

function getAvailableDatesPayload() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = spreadsheet.insertSheet(SHEET_NAME);
      newSheet.appendRow(['Date', 'Guest Artist', 'Name', 'Instrument', 'Piece', 'Duration', 'Remarks']);
      Logger.log('Created new sheet, returning fallback dates');
      return { success: true, dates: [] };
    }

    // Get all data
    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // First row is headers
    const rows = data.slice(1); // Skip headers

    Logger.log('Total rows in sheet: ' + rows.length);

    // Group rows by date and count total vs occupied slots
    const dateAvailability = {};
    let currentDate = ''; // Track the current date for forward-filling
    let currentGuest = ''; // Track the current guest artist
    
    rows.forEach((row, index) => {
      const dateValue = row[0]; // Date column
      const guestValue = row[1]; // Guest Artist column
      
      // Update current date if this row has a date value
      if (dateValue && dateValue !== '') {
        // Convert date to string format (handle both Date objects and strings)
        if (typeof dateValue === 'object' && dateValue instanceof Date) {
          currentDate = Utilities.formatDate(dateValue, Session.getScriptTimeZone(), 'MMM d');
        } else {
          currentDate = String(dateValue).trim();
        }
        
        Logger.log('Row ' + (index + 2) + ': New date found: "' + currentDate + '"');
      }
      
      // Update current guest if this row has a guest value
      if (guestValue && guestValue !== '') {
        currentGuest = String(guestValue).trim();
        Logger.log('  Guest artist: "' + currentGuest + '"');
      }
      
      // Skip rows with no current date (happens at the start before first date)
      if (!currentDate || currentDate === '') {
        return;
      }

      // Initialize date entry if first time seeing it
      if (!dateAvailability[currentDate]) {
        dateAvailability[currentDate] = {
          totalSlots: 0,
          occupiedSlots: 0,
          guestArtist: currentGuest
        };
      }
      
      // Count this as a slot
      dateAvailability[currentDate].totalSlots++;

      // Check if this slot is occupied
      // A slot is occupied if Name column has content (and it's not "N/A")
      const name = row[2] || ''; // Column C: Name
      const nameStr = name.toString().trim();
      
      // Skip N/A entries and empty - they're not real occupied slots
      if (nameStr !== '' && nameStr.toUpperCase() !== 'N/A') {
        dateAvailability[currentDate].occupiedSlots++;
        Logger.log('  Row ' + (index + 2) + ': Occupied by "' + nameStr + '"');
      } else {
        Logger.log('  Row ' + (index + 2) + ': Available slot');
      }
    });

    Logger.log('==== Date Availability Summary ====');
    Object.keys(dateAvailability).forEach(dateStr => {
      const avail = dateAvailability[dateStr];
      Logger.log(dateStr + ': Total=' + avail.totalSlots + ', Occupied=' + avail.occupiedSlots + ', Available=' + (avail.totalSlots - avail.occupiedSlots) + ', Guest="' + avail.guestArtist + '"');
    });

    // Check each date for availability and future status
    const availableDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    Object.keys(dateAvailability).forEach(dateStr => {
      const date = parseDate(dateStr);
      
      if (!date) {
        Logger.log('Could not parse date: "' + dateStr + '"');
        return;
      }

      // Only show future dates (or today)
      if (date < today) {
        Logger.log('Date in past, skipping: "' + dateStr + '"');
        return;
      }

      const availability = dateAvailability[dateStr];
      const hasAvailableSlots = availability.occupiedSlots < availability.totalSlots;

      if (hasAvailableSlots) {
        // Create a readable label
        const label = createDateLabel(date, dateStr, availability.guestArtist);
        
        availableDates.push({
          date: dateStr,
          label: label,
          available: true,
          rawDate: dateStr,
          totalSlots: availability.totalSlots,
          occupiedSlots: availability.occupiedSlots,
          availableSlots: availability.totalSlots - availability.occupiedSlots
        });
        
        Logger.log('✓ Added available date: "' + dateStr + '" - ' + label);
      } else {
        Logger.log('✗ Date fully booked: "' + dateStr + '"');
      }
    });

    // Sort dates chronologically
    availableDates.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA - dateB;
    });

    Logger.log('==== Final Result ====');
    Logger.log('Total available dates: ' + availableDates.length);

    return { success: true, dates: availableDates };

  } catch (error) {
    Logger.log('ERROR in getAvailableDatesPayload: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return {
      success: false,
      message: 'Error fetching available dates: ' + error.message,
      dates: []
    };
  }
}

// Handle CORS preflight requests
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Parse date string into Date object
function parseDate(dateStr) {
  try {
    // Handle various date formats
    if (typeof dateStr === 'object' && dateStr instanceof Date) {
      return dateStr;
    }

    const strDate = dateStr.toString().trim();

    // Try parsing formats like "Oct 18", "Nov 8", "Nov 29", "Dec 6", "Sept 13"
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                       'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const upperDateStr = strDate.toLowerCase();
    
    // Check for September first (special case - can be "Sept" or "Sep")
    if (upperDateStr.includes('sept') || upperDateStr.startsWith('sep ')) {
      const parts = upperDateStr.match(/(\w+)\s+(\d{1,2})(?:.*?(\d{4}))?/);
      if (parts) {
        const month = 8; // September is month 8 (0-indexed)
        const day = parseInt(parts[2]);
        const year = parts[3] ? parseInt(parts[3]) : 2025;
        return new Date(year, month, day);
      }
    }

    // Check other months
    for (let i = 0; i < monthNames.length; i++) {
      if (upperDateStr.includes(monthNames[i])) {
        // Match patterns like "Oct 18", "Nov 8" (single or double digit days)
        const parts = upperDateStr.match(/(\w+)\s+(\d{1,2})(?:.*?(\d{4}))?/);
        if (parts) {
          const month = i;
          const day = parseInt(parts[2]);
          const year = parts[3] ? parseInt(parts[3]) : 2025; // Default to 2025
          return new Date(year, month, day);
        }
      }
    }

    // Try direct Date parse as fallback
    const date = new Date(strDate);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  } catch (error) {
    Logger.log('Error parsing date: ' + dateStr + ' - ' + error.message);
    return null;
  }
}

// Helper function to create readable labels
function createDateLabel(dateObj, dateStr, guestArtist) {
  // Format date as "Month Day, Year"
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[dateObj.getMonth()];
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  
  let label = `${month} ${day}, ${year}`;
  
  // Add class type based on guest artist
  if (guestArtist && guestArtist.trim() !== '') {
    const guest = guestArtist.toString().trim().toLowerCase();
    
    // Check for HOST - indicates Performance Class
    if (guest === 'host') {
      label += ' - Performance Class';
    }
    // Check for masterclass indicators
    else if (guest.includes('mercer')) {
      label += ' - Cello Masterclass';
    }
    else if (guest.includes('chooi') || guest.includes('kim') || guest.includes('roseman')) {
      label += ' - Violin Masterclass';
    }
    else if (guest.includes('thies')) {
      label += ' - Viola Masterclass';
    }
    else if (guest.includes('harrison')) {
      label += ' - Cello Masterclass';
    }
    else if (guest.includes('van der sloot') || guest.includes('sloot')) {
      label += ' - Violin/Viola Masterclass';
    }
    else if (guest.toLowerCase() !== 'n/a') {
      // Default to including guest artist name (if not N/A)
      label += ` - Masterclass with ${guestArtist}`;
    }
    else {
      label += ' - Performance Class';
    }
  } else {
    label += ' - Performance Class';
  }
  
  return label;
}

function doPost(e) {
  try {
    // Parse the JSON data from the request
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!data.date || !data.name || !data.instrument || !data.piece || !data.duration) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Missing required fields'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = spreadsheet.insertSheet(SHEET_NAME);
      newSheet.appendRow(['Date', 'Guest Artist', 'Name', 'Instrument', 'Piece', 'Duration', 'Remarks']);
      sheet = newSheet;
    }

    // Find and fill the first available slot for the selected date
    const result = findAndFillAvailableSlot(sheet, data);

    if (result.success) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Registration submitted successfully!'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: result.message
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'An error occurred while processing your registration. Please try again.'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

// Find and fill the first available slot for a given date
function findAndFillAvailableSlot(sheet, registrationData) {
  try {
    Logger.log('Finding available slot for date: "' + registrationData.date + '"');
    
    // Get all data
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1); // Skip headers
    
    let currentDate = '';
    const matchingRows = [];

    // Find all rows that belong to the requested date (using forward-fill logic)
    rows.forEach((row, index) => {
      const dateValue = row[0];
      
      // Update current date if this row has a date value
      if (dateValue && dateValue !== '') {
        if (typeof dateValue === 'object' && dateValue instanceof Date) {
          currentDate = Utilities.formatDate(dateValue, Session.getScriptTimeZone(), 'MMM d');
        } else {
          currentDate = String(dateValue).trim();
        }
      }
      
      // If this row belongs to our target date, add it
      if (currentDate === registrationData.date) {
        matchingRows.push({ row: row, rowIndex: index + 2 }); // +2 for header and 0-index
      }
    });
    
    Logger.log('Found ' + matchingRows.length + ' rows for date "' + registrationData.date + '"');

    // Look for the first available slot (empty Name, Instrument, Piece columns)
    for (let item of matchingRows) {
      const row = item.row;
      const name = row[2] || ''; // Column C
      const instrument = row[3] || ''; // Column D
      const piece = row[4] || ''; // Column E

      const nameStr = name.toString().trim();
      const instrumentStr = instrument.toString().trim();
      const pieceStr = piece.toString().trim();

      // Check if this slot is available (name is empty or N/A, and no instrument/piece)
      if ((nameStr === '' || nameStr.toUpperCase() === 'N/A') && instrumentStr === '' && pieceStr === '') {
        Logger.log('Found available slot at row ' + item.rowIndex);
        
        // Fill in the available slot
        sheet.getRange(item.rowIndex, 3, 1, 4).setValues([[
          registrationData.name,       // Column C: Name
          registrationData.instrument, // Column D: Instrument
          registrationData.piece,      // Column E: Piece
          registrationData.duration    // Column F: Duration
        ]]);

        // Also fill in remarks if provided
        if (registrationData.remarks) {
          sheet.getRange(item.rowIndex, 7).setValue(registrationData.remarks); // Column G: Remarks
        }

        Logger.log('Successfully filled slot');

        // Send confirmation email
        sendConfirmationEmail(registrationData);

        return { success: true };
      }
    }

    // No available slot found
    Logger.log('No available slots found');
    return {
      success: false,
      message: 'No available slots for the selected date. Please choose a different date.'
    };

  } catch (error) {
    Logger.log('Error finding available slot: ' + error.message);
    return {
      success: false,
      message: 'Error finding available slot. Please try again.'
    };
  }
}

// Send confirmation email to the student
function sendConfirmationEmail(registrationData) {
  try {
    const recipientEmail = registrationData.email;
    const studentName = registrationData.name;
    const performanceDate = registrationData.date;
    const instrument = registrationData.instrument;
    const piece = registrationData.piece;
    const duration = registrationData.duration;

    const subject = 'Performance Registration Confirmation - UOttawa Pre-College Program';

    const htmlBody = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6d0a2e, #d4af37); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">UOttawa Pre-College Program</h1>
          <p style="color: #f5f6ff; margin: 10px 0 0 0; font-size: 16px;">Excellence in Music Education</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #6d0a2e; margin-bottom: 20px; text-align: center;">Registration Confirmed!</h2>

          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Dear ${studentName},</p>

          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Thank you for registering for a performance class! Your registration has been successfully processed.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
            <h3 style="color: #6d0a2e; margin: 0 0 15px 0; font-size: 18px;">Performance Details:</h3>
            <p style="margin: 8px 0; color: #333;"><strong>Date:</strong> ${performanceDate}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Instrument:</strong> ${instrument}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Piece:</strong> ${piece}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Duration:</strong> ${duration}</p>
          </div>

          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            We look forward to hearing your performance! Please arrive 15 minutes before your scheduled time and ensure you have all necessary materials.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              If you have any questions, please don't hesitate to contact us.
            </p>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              University of Ottawa Pre-College Program<br>
              Excellence in Music Education
            </p>
          </div>
        </div>
      </div>
    `;

    const textBody = `
      UOttawa Pre-College Program - Registration Confirmation

      Dear ${studentName},

      Thank you for registering for a performance class! Your registration has been successfully processed.

      Performance Details:
      - Date: ${performanceDate}
      - Instrument: ${instrument}
      - Piece: ${piece}
      - Duration: ${duration}

      We look forward to hearing your performance! Please arrive 15 minutes before your scheduled time and ensure you have all necessary materials.

      If you have any questions, please don't hesitate to contact us.

      University of Ottawa Pre-College Program
      Excellence in Music Education
    `;

    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlBody: htmlBody,
      body: textBody
    });

    Logger.log('Confirmation email sent to: ' + recipientEmail);

  } catch (error) {
    Logger.log('Error sending confirmation email: ' + error.message);
    // Don't fail the registration if email fails
  }
}

// Function to set up the sheet (run this once manually)
function setupSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    const newSheet = spreadsheet.insertSheet(SHEET_NAME);
    newSheet.appendRow(['Date', 'Guest Artist', 'Name', 'Instrument', 'Piece', 'Duration', 'Remarks']);
    Logger.log('Sheet setup complete');
  } else {
    Logger.log('Sheet already exists');
  }
}
