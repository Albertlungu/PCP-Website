# PCP Website - Google Sheets Integration Setup

## Problem
The sign up form was not actually sending data to Google Sheets. The JavaScript was simulating success but not making real API calls.

## Solution
I've created a complete Google Apps Script integration that now also fetches available dates dynamically from Google Sheets.

## Steps to Complete the Integration

### 1. Deploy the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy the **updated** contents of `google-apps-script.js` into the Code.gs file (includes CORS headers)
4. Update the `SPREADSHEET_ID` if needed (currently set to your existing sheet)
5. **IMPORTANT**: Since I've added CORS headers and `doOptions` function, you need to redeploy the script:
   - Click "Deploy" → "New deployment"
   - Select "Web app" as deployment type
   - Set "Execute as: Me" and "Who has access: Anyone"
   - Copy the NEW Web App URL

### 2. Update the JavaScript

1. In `signup.js`, update line 9 with your **new** Google Apps Script URL
2. The script now properly handles CORS, so it will work in development and production

### 3. Set Up Your Google Sheet

The system now uses a **single sheet** (Sheet1) for everything. The sheet should have these columns:
- **Date**: The performance date
- **Guest Artist**: For guest artist bookings (leave empty for student registrations)
- **Name**: Student's name
- **Instrument**: Student's instrument
- **Piece**: Piece to be performed
- **Duration**: Performance duration
- **Remarks**: Additional notes

The available dates are automatically extracted from the Date column. You can pre-populate the sheet with available dates, or the system will fall back to default dates if none are found.

### 4. Test the Integration

1. Make sure your Google Sheet is shared with your Google account (the one running the script)
2. Submit a test registration through the website
3. Check your Google Sheet - the data should appear in a new row
4. Verify that available dates are showing in the signup form dropdown

## Files Modified

- `signup.js` - Added automatic CORS/JSONP/no-cors fallback system with detailed logging
- `google-apps-script.js` - Complete rewrite with proper CORS headers, future date filtering, and sophisticated slot counting

## How It Works

1. **Loading dates**: When the signup page loads, it first tries CORS, then automatically falls back to JSONP if CORS fails
2. **Smart availability counting**: For each future date, the system counts:
   - **Total slots**: How many rows exist for that date (each row = 1 slot)
   - **Occupied slots**: How many rows have the Name field filled
   - **Available slots**: Total slots - Occupied slots
3. **Display logic**: Only dates with available slots (where occupied < total) are shown to users
4. **Form submission**: When users submit, the system finds the first available empty slot for their selected date and fills it in
5. **Data storage**: All data is stored in the same Sheet1 with proper column structure

## Automatic Fallback System

The system is designed to work regardless of CORS restrictions:
- **CORS Mode**: First tries standard browser fetch with proper headers
- **JSONP Fallback**: Automatically switches to JSONP if CORS fails
- **No-CORS Backup**: For form submissions, falls back to no-cors mode if needed

This ensures the system works in all environments without manual configuration.

## Sheet Structure

Your Google Sheet should have these columns:
- **Date**: The performance date (e.g., "Nov 08", "November 8, 2025")
- **Guest Artist**: For guest artist bookings (leave empty for student registrations)
- **Name**: Student's name (empty = available slot)
- **Instrument**: Student's instrument (empty = available slot)
- **Piece**: Piece to be performed (empty = available slot)
- **Duration**: Performance duration (empty = available slot)
- **Remarks**: Additional notes

### Adding Available Dates

To add new performance dates:
1. Add rows to your sheet with the date in column A
2. Leave columns C, D, E, F empty for each slot you want to make available
3. The system will automatically detect these as available slots

Example for Nov 8 with 6 available slots:
```
Date        | Guest Artist | Name | Instrument | Piece | Duration | Remarks
Nov 08      |              |      |            |       |          | (slot 1 - empty)
Nov 08      |              |      |            |       |          | (slot 2 - empty)
Nov 08      |              |      |            |       |          | (slot 3 - empty)
Nov 08      |              | John | Violin     | Bach  | 15'      | (slot 4 - filled)
Nov 08      |              |      |            |       |          | (slot 5 - empty)
Nov 08      |              |      |            |       |          | (slot 6 - empty)
```

In this example:
- **Total slots**: 6 rows
- **Occupied slots**: 1 row (John's registration)
- **Available slots**: 5 slots
- **Shows as available**: ✅ Yes (5 > 0)

## Troubleshooting

- **System automatically handles CORS**: The script tries CORS first, then JSONP, then no-cors - no manual intervention needed
- **"Script not found" error**: Make sure the Google Apps Script URL is correct and accessible
- **No dates showing**: Check that your Google Sheet has future dates in the Date column (first column) with empty registration slots
- **"No available slots" error**: All slots for the selected date are filled. Add more empty rows for that date or choose a different date
- **Past dates showing**: The system should only show future dates. Check that your date format is recognized correctly
- **"Permission denied"**: Ensure your Google Sheet is shared with the account running the script
- **No data in sheet**: Check the Google Apps Script execution logs for errors

The system will automatically work around any CORS restrictions!
