// Google Apps Script for PCP Website Performance Signups
// This script receives form submissions and writes them to Google Sheets

// Replace with your actual Google Sheets ID
const SPREADSHEET_ID = '1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68';
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    // Parse the JSON data from the request
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!data.date || !data.name || !data.instrument || !data.piece || !data.duration) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = spreadsheet.insertSheet(SHEET_NAME);
      newSheet.appendRow(['Date', 'Name', 'Instrument', 'Piece', 'Duration', 'Remarks', 'Submission Date']);
      sheet = newSheet;
    }

    // Check if headers exist, if not add them
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
      sheet.appendRow(['Date', 'Name', 'Instrument', 'Piece', 'Duration', 'Remarks', 'Submission Date']);
    }

    // Add timestamp
    const timestamp = new Date().toLocaleString();

    // Prepare the row data
    const rowData = [
      data.date,
      data.name,
      data.instrument,
      data.piece,
      data.duration,
      data.remarks || '',
      timestamp
    ];

    // Append the data to the sheet
    sheet.appendRow(rowData);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Registration submitted successfully!'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);

    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'An error occurred while processing your registration. Please try again.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to set up the sheet (run this once manually)
function setupSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    const newSheet = spreadsheet.insertSheet(SHEET_NAME);
    newSheet.appendRow(['Date', 'Name', 'Instrument', 'Piece', 'Duration', 'Remarks', 'Submission Date']);
    Logger.log('Sheet setup complete');
  } else {
    Logger.log('Sheet already exists');
  }
}
