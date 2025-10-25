# PCP Website - Google Sheets Integration Setup

## Problem
The sign up form was not actually sending data to Google Sheets. The JavaScript was simulating success but not making real API calls.

## Solution
I've created a Google Apps Script and updated the signup.js to properly integrate with Google Sheets.

## Steps to Complete the Integration

### 1. Deploy the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy the entire contents of `google-apps-script.js` into the Code.gs file
4. Update the `SPREADSHEET_ID` if needed (currently set to your existing sheet)
5. Click "Deploy" → "New deployment"
6. Select "Web app" as deployment type
7. Set "Execute as: Me" and "Who has access: Anyone"
8. Copy the Web App URL

### 2. Update the JavaScript

1. In `signup.js`, find line 73: `const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your deployed Google Apps Script URL

### 3. Test the Integration

1. Make sure your Google Sheet is shared with your Google account (the one running the script)
2. Submit a test registration through the website
3. Check your Google Sheet - the data should appear in a new row

## Files Modified

- `signup.js` - Updated to use actual Google Apps Script instead of simulation
- `google-apps-script.js` - New file with the Google Apps Script code

## How It Works

1. User fills out the signup form
2. JavaScript validates the form data
3. If valid, sends POST request to Google Apps Script
4. Script writes the data to your Google Sheet
5. User sees success message

## Troubleshooting

- **"Script not found" error**: Make sure the Google Apps Script URL is correct and accessible
- **"Permission denied"**: Ensure your Google Sheet is shared with the account running the script
- **No data in sheet**: Check the Google Apps Script execution logs for errors

The form will now actually save data to your Google Sheet when users submit registrations!
