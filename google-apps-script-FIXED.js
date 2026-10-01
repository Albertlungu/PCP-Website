// Google Apps Script for PCP Website Performance Signups
// This script receives form submissions and writes them to Google Sheets
//
// Sheet layout (tab "Performances"):
//   Row 1: title, e.g. "uOttawa PCP 2026-27 Performance Class/Master Class Schedule"
//   Row 2: column headers
//   Columns: A Date, B Guest Artist, C Remarks, D Student Name, E Instrument, F Piece, G Duration
// A row under a date with an empty Student Name is an open slot.
//
// After editing, redeploy: Deploy > Manage deployments > Edit > New version,
// with "Execute as: Me" and "Who has access: Anyone".

const SPREADSHEET_ID = '1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68';
const SHEET_NAME = 'Performances';
const HEADER_ROWS = 2;

// Column indexes (0-based) within a row
const COL_DATE = 0;
const COL_GUEST = 1;
const COL_REMARKS = 2;
const COL_NAME = 3;
const COL_INSTRUMENT = 4;
const COL_PIECE = 5;

// TextOutput has no setHeader(); Apps Script web apps add the CORS header themselves
function jsonOutput(payload, callback) {
  if (callback) {
    // Only allow plain identifiers as JSONP callback names
    if (!/^[A-Za-z_$][\w$]*$/.test(callback)) {
      callback = 'callback';
    }
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(payload) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const callback = e.parameter.callback; // JSONP callback name (optional)
  try {
    if (e.parameter.action === 'getAvailableDates') {
      return jsonOutput(getAvailableDatesPayload(), callback);
    }
    return jsonOutput({ success: false, message: 'Invalid action parameter' }, callback);
  } catch (error) {
    Logger.log('Error in doGet: ' + error.message);
    return jsonOutput({ success: false, message: 'An error occurred while fetching data' }, callback);
  }
}

function getSheet() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" not found');
  }
  return sheet;
}

function cellToString(value) {
  return value === null || value === undefined ? '' : value.toString().trim();
}

function isNA(value) {
  return cellToString(value).toUpperCase() === 'N/A';
}

// Normalize a date cell to a string like "Oct 18"
function dateCellToString(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'MMM d');
  }
  return cellToString(value);
}

// The schedule runs Sept-June; read the start year from the title row ("2026-27"),
// otherwise assume the academic year containing today.
function getAcademicStartYear(data) {
  const title = cellToString(data[0] && data[0][0]);
  const match = title.match(/(\d{4})\s*[-–\/]\s*\d{2,4}/);
  if (match) return parseInt(match[1], 10);
  const today = new Date();
  return today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
}

function getAvailableDatesPayload() {
  try {
    const data = getSheet().getDataRange().getValues();
    const startYear = getAcademicStartYear(data);
    const rows = data.slice(HEADER_ROWS);

    // Group rows by date (forward-filling blank date cells) and count open vs occupied slots
    const dateAvailability = {};
    const dateOrder = [];
    let currentDate = '';

    rows.forEach(row => {
      const dateValue = dateCellToString(row[COL_DATE]);
      if (dateValue) {
        currentDate = dateValue;
        if (!dateAvailability[currentDate]) {
          dateAvailability[currentDate] = {
            openSlots: 0,
            occupiedSlots: 0,
            guestArtist: cellToString(row[COL_GUEST]),
            remarks: cellToString(row[COL_REMARKS])
          };
          dateOrder.push(currentDate);
        }
      }
      if (!currentDate) return;

      const name = cellToString(row[COL_NAME]);
      if (isNA(name)) return; // "N/A" means no performers that day, not a free slot
      if (name === '') {
        dateAvailability[currentDate].openSlots++;
      } else {
        dateAvailability[currentDate].occupiedSlots++;
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableDates = [];
    dateOrder.forEach(dateStr => {
      const availability = dateAvailability[dateStr];
      const date = parseDate(dateStr, startYear);
      if (!date || date < today) return;

      // Skip days without classes, e.g. "NO CLASSES (OYO Concert)"
      const notes = (availability.remarks + ' ' + availability.guestArtist).toLowerCase();
      if (/no class/.test(notes)) return;

      if (availability.openSlots > 0) {
        availableDates.push({
          date: dateStr,
          label: createDateLabel(date, availability.remarks, availability.guestArtist),
          available: true,
          rawDate: dateStr,
          totalSlots: availability.openSlots + availability.occupiedSlots,
          occupiedSlots: availability.occupiedSlots,
          availableSlots: availability.openSlots,
          time: date.getTime()
        });
      }
    });

    availableDates.sort((a, b) => a.time - b.time);
    availableDates.forEach(d => delete d.time);

    return { success: true, dates: availableDates };

  } catch (error) {
    Logger.log('ERROR in getAvailableDatesPayload: ' + error.message);
    return {
      success: false,
      message: 'Error fetching available dates',
      dates: []
    };
  }
}

// Parse a date string like "Sept 13" into a Date within the academic year
function parseDate(dateStr, startYear) {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const match = cellToString(dateStr).toLowerCase().match(/^([a-z]+)\.?\s+(\d{1,2})\b/);
  if (!match) return null;

  const month = months.indexOf(match[1].slice(0, 3));
  if (month === -1) return null;

  // August-December belong to the start year, January-July to the next
  const year = month >= 7 ? startYear : startYear + 1;
  return new Date(year, month, parseInt(match[2], 10));
}

// Readable label like "October 17, 2026 - Cello Masterclass"
function createDateLabel(dateObj, remarks, guestArtist) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  let label = monthNames[dateObj.getMonth()] + ' ' + dateObj.getDate() + ', ' + dateObj.getFullYear();

  if (remarks) {
    label += ' - ' + remarks;
  } else if (guestArtist && !isNA(guestArtist)) {
    label += ' - Masterclass with ' + guestArtist;
  } else {
    label += ' - Performance Class';
  }
  return label;
}

function doPost(e) {
  // Serialize sign-ups so two students can't claim the same slot
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse(e.postData.contents);

    if (!data.date || !data.name || !data.email || !data.instrument || !data.piece || !data.duration) {
      return jsonOutput({ success: false, message: 'Missing required fields' });
    }

    lock.waitLock(20000);
    const result = findAndFillAvailableSlot(getSheet(), data);

    if (result.success) {
      return jsonOutput({ success: true, message: 'Registration submitted successfully!' });
    }
    return jsonOutput({ success: false, message: result.message });

  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    return jsonOutput({
      success: false,
      message: 'An error occurred while processing your registration. Please try again.'
    });
  } finally {
    lock.releaseLock();
  }
}

// Find and fill the first available slot for a given date
function findAndFillAvailableSlot(sheet, registrationData) {
  try {
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(HEADER_ROWS);
    const targetDate = cellToString(registrationData.date);

    let currentDate = '';
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const dateValue = dateCellToString(row[COL_DATE]);
      if (dateValue) currentDate = dateValue;
      if (currentDate !== targetDate) continue;

      const name = cellToString(row[COL_NAME]);
      const instrument = cellToString(row[COL_INSTRUMENT]);
      const piece = cellToString(row[COL_PIECE]);

      if (name === '' && instrument === '' && piece === '') {
        const rowNumber = index + HEADER_ROWS + 1; // 1-based sheet row

        // Columns D-G: Name, Instrument, Piece, Duration
        sheet.getRange(rowNumber, COL_NAME + 1, 1, 4).setValues([[
          registrationData.name,
          registrationData.instrument,
          registrationData.piece,
          registrationData.duration
        ]]);

        // Column C holds the event label, so keep student remarks as a note on their name
        if (registrationData.remarks) {
          sheet.getRange(rowNumber, COL_NAME + 1).setNote(registrationData.remarks);
        }

        sendConfirmationEmail(registrationData);
        return { success: true };
      }
    }

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

function escapeHtml(value) {
  return cellToString(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Dear ${escapeHtml(studentName)},</p>

          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Thank you for registering for a performance class! Your registration has been successfully processed.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
            <h3 style="color: #6d0a2e; margin: 0 0 15px 0; font-size: 18px;">Performance Details:</h3>
            <p style="margin: 8px 0; color: #333;"><strong>Date:</strong> ${escapeHtml(performanceDate)}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Instrument:</strong> ${escapeHtml(instrument)}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Piece:</strong> ${escapeHtml(piece)}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Duration:</strong> ${escapeHtml(duration)}</p>
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
