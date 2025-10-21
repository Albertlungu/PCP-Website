# PCP Website - Performance Calendar & Signup System

## Overview
This enhanced PCP (Pre-College Program) website now includes:
- **Performance Calendar** - Interactive calendar displaying masterclasses and performance classes
- **Signup System** - Form for students to register for upcoming performances
- **Enhanced Design** - Refined visual elements while maintaining formal aesthetic

## New Features

### 📅 Calendar Page (`calendar.html`)
- **Calendar View**: Interactive monthly calendar with event indicators
- **List View**: Detailed list of all upcoming events
- **Event Filtering**: Filter by masterclasses, performance classes, or all events
- **Event Details Modal**: Click any event to see full details including performers and pieces
- Color-coded event types:
  - 🟡 **Gold** - Masterclasses
  - 🔴 **Burgundy** - Performance Classes
  - 🔵 **Blue** - Special Events

### 📝 Signup Page (`signup.html`)
- **Available Slots Display**: Shows upcoming dates with availability
- **Registration Form**: Complete form for performance signup with fields:
  - Performance Date (dropdown)
  - Student Name
  - Instrument
  - Piece Title
  - Duration (auto-formatted)
  - Additional Remarks
- **Form Validation**: Real-time validation with helpful error messages
- **Success Confirmation**: Visual feedback upon successful submission

## Setup Instructions

### 1. Google Sheets API Setup

To connect the calendar and signup form to your Google Spreadsheet, you need to set up the Google Sheets API:

#### Option A: Using Google Apps Script (Recommended for Signup)

1. Open your Google Spreadsheet: `https://docs.google.com/spreadsheets/d/1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68/`

2. Go to **Extensions** → **Apps Script**

3. Create a new script file and paste this code:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Find the next empty row
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    // Append the new performance data
    sheet.appendRow([
      data.date,
      'TBA', // Guest Artist - to be assigned
      data.name,
      data.instrument,
      data.piece,
      data.duration,
      data.remarks || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Performance registered successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  return ContentService
    .createTextOutput(JSON.stringify({ data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. **Deploy the script**:
   - Click **Deploy** → **New deployment**
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copy the **Web app URL**

5. **Update `signup.js`**:
   - Open `signup.js`
   - Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your Web app URL

#### Option B: Using Google Sheets API (For Calendar Reading)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select existing: "pcp-website-475812"

3. Enable Google Sheets API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Sheets API"
   - Click **Enable**

4. Create API Key:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy the API key

5. **Update `calendar.js`**:
   - Open `calendar.js`
   - Replace `YOUR_API_KEY_HERE` with your actual API key
   - Uncomment the API fetch code

6. Make spreadsheet publicly readable:
   - Open your Google Sheet
   - Click **Share**
   - Change to "Anyone with the link can view"

### 2. Service Account Setup (Alternative Method)

Using the service account email you provided:
`albertlungu@pcp-website-475812.iam.gserviceaccount.com`

1. Share your Google Spreadsheet with this email address (Editor access for write, Viewer for read-only)

2. Download the JSON key file for this service account from Google Cloud Console

3. For server-side implementation, you would use this key to authenticate API requests

## File Structure

```
pcp-website/
├── index.html                      # Homepage
├── calendar.html                   # NEW: Calendar page
├── signup.html                     # NEW: Signup page
├── styles.css                      # Main styles
├── styles-calendar-signup.css      # NEW: Calendar & signup styles
├── script.js                       # Main JavaScript
├── calendar.js                     # NEW: Calendar functionality
├── signup.js                       # NEW: Signup functionality
├── performance-class.html          # Performance class info
├── (other existing pages...)
└── README.md                       # This file
```

## Data Flow

### Calendar Display
1. `calendar.js` reads from Google Sheets
2. Parses performance schedule data
3. Generates interactive calendar view
4. Displays events with proper formatting

### Signup Process
1. User fills out form on `signup.html`
2. Form validation in `signup.js`
3. Data sent to Google Apps Script
4. Script appends new row to spreadsheet
5. Confirmation shown to user

## Spreadsheet Format

Your spreadsheet should maintain this structure:

| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|----------|----------|----------|----------|----------|----------|
| Date     | Guest Artist | Name | Instrument | Piece | Duration | Remarks |
| Sept 13  | Rachel Mercer | Student Name | Violin | Piece Title | 12' 30" | Masterclass |

## Customization

### Adding New Instruments
Edit `signup.html`, find the instrument dropdown and add options:
```html
<option value="YourInstrument">Your Instrument</option>
```

### Changing Color Scheme
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6d0a2e;    /* Burgundy */
    --accent-color: #d4af37;      /* Gold */
    /* Add your colors */
}
```

### Modifying Event Types
Edit `calendar.js` to add new event type classifications in the `parseSheetData()` function.

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design included

## Troubleshooting

### Calendar not loading events
- Check that the API key is correct in `calendar.js`
- Verify spreadsheet is publicly accessible
- Check browser console for errors

### Signup form not submitting
- Verify Google Apps Script URL is correct
- Check that script has proper permissions
- Ensure spreadsheet is shared with service account

### Styling issues
- Clear browser cache
- Check that `styles-calendar-signup.css` is linked in HTML
- Verify CSS file paths are correct

## Next Steps

1. **Set up Google Apps Script** for the signup form (highest priority)
2. **Configure API access** for calendar reading
3. **Test submission flow** end-to-end
4. **Customize confirmation emails** (optional - can be added to Apps Script)
5. **Add calendar export** functionality (optional feature)

## Support

For questions or issues:
- Check the browser console for JavaScript errors
- Verify all file paths are correct
- Ensure Google Sheets permissions are set properly
- Test with a simplified version of the spreadsheet first

## License

This website is property of the University of Ottawa Pre-College Program.
