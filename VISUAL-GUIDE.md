# PCP Website - Visual Guide

## 🎨 What Your New Pages Look Like

### Calendar Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Calendar View] [List View]  |  [All] [Masterclasses] [Performances]  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│              ◀  September 2024  ▶                        │
│                                                           │
│   Sun   Mon   Tue   Wed   Thu   Fri   Sat               │
│   ───   ───   ───   ───   ───   ───   ───               │
│    1     2     3     4     5     6     7                 │
│    8     9    10    11    12    13●   14                 │  ● = Has Event
│   15    16    17    18    19    20●   21                 │
│   22    23    24    25    26    27●   28                 │
│   29    30                                                │
│                                                           │
│   Legend:                                                 │
│   🟡 Masterclass  🔴 Performance Class  🔵 Special       │
└─────────────────────────────────────────────────────────┘
```

**Features visible:**
- Month navigation arrows
- View toggle buttons (Calendar/List)
- Filter buttons for event types
- Interactive calendar grid
- Colored dots on dates with events
- "Today" is highlighted with gold border

### When you click a date:

```
┌──────────────────────────────────┐
│  ✕                                │
│                                   │
│  Violin Masterclass               │
│  September 27, 2024               │
│  Guest Artist: Chooi              │
│                                   │
│  Performers:                      │
│  • Philippe Lafleur - Violin      │
│    Mendelssohn Concerto           │
│    Duration: 14' 00"              │
│                                   │
│  • Vincent Pham - Violin          │
│    Sibelius Concerto              │
│    Duration: 17' 30"              │
│                                   │
│  • Sakura Sone - Violin           │
│    Wieniawski Scherzo-Tarantelle  │
│    Duration: 5' 00"               │
│                                   │
└──────────────────────────────────┘
```

### List View:

```
┌─────────────────────────────────────────────┐
│  ┌──┐  Violin Masterclass                   │
│  │13│  Guest: Chooi                         │
│  │SEP│  • Philippe Lafleur - Mendelssohn... │
│  └──┘  • Vincent Pham - Sibelius...        │
├─────────────────────────────────────────────┤
│  ┌──┐  Cello Masterclass                    │
│  │04│  Guest: Harrison                      │
│  │OCT│  • Noah & Ella Marks - Brahms...    │
│  └──┘  • Josie van der Sloot - Haydn...    │
├─────────────────────────────────────────────┤
│  ┌──┐  Performance Class                    │
│  │18│  Guest: HOST                          │
│  │OCT│  • Vincent Pham - Sibelius...       │
│  └──┘  • Henrik Stephenson - Elgar...      │
└─────────────────────────────────────────────┘
```

---

## 📝 Signup Page Layout

### Top Section (Available Slots):

```
┌──────────────────────────────────────────────────────────┐
│              Upcoming Available Slots                     │
│                                                           │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐│
│  │ 🎵            │  │ 🎵            │  │ 🎵           ││
│  │ November 8    │  │ November 22   │  │ November 29  ││
│  │ Performance   │  │ Violin        │  │ Viola        ││
│  │ Class         │  │ Masterclass   │  │ Masterclass  ││
│  │ ✓ Available   │  │ ✓ Available   │  │ ✓ Available  ││
│  └───────────────┘  └───────────────┘  └──────────────┘│
└──────────────────────────────────────────────────────────┘
```

### Form Section:

```
┌──────────────────────────────────────────────────────────┐
│           Register Your Performance                       │
│                                                           │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │ Performance Date *  │  │ Your Name *             │   │
│  │ [Select date...  ▼] │  │ [e.g., John Smith]      │   │
│  └─────────────────────┘  └─────────────────────────┘   │
│                                                           │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │ Instrument *        │  │ Estimated Duration *    │   │
│  │ [Select...       ▼] │  │ [e.g., 12' 30'']        │   │
│  └─────────────────────┘  └─────────────────────────┘   │
│                           Format: minutes' seconds''      │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Piece Title *                                     │   │
│  │ [e.g., Mozart Violin Concerto #3...]             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Additional Remarks (Optional)                     │   │
│  │ [Any special requirements...]                     │   │
│  │                                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│         ┌─────────────────────────────────┐              │
│         │   Submit Registration           │              │
│         └─────────────────────────────────┘              │
│                                                           │
│    ✓ Your registration has been submitted successfully!  │
│                                                           │
│         [View Full Calendar]                              │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

All new pages use your existing color palette:

- **Primary (Burgundy)**: `#6d0a2e` - Main branding color
- **Accent (Gold)**: `#d4af37` - Highlights and important elements
- **Background**: Dark gradient with subtle animations
- **Cards**: Frosted glass effect (glassmorphism)
- **Text**: Light on dark for readability

---

## 🌟 Visual Effects

### Hover States:
- Cards lift up slightly (transform: translateY(-2px))
- Background brightens
- Border glows with gold accent
- Smooth transitions (0.3s)

### Form Interactions:
- Inputs glow when focused
- Invalid fields show red border
- Success message: Green with checkmark
- Error message: Red with warning

### Calendar Interactions:
- Event dots pulse subtly
- Today's date has gold border
- Clicking dates shows smooth modal animation
- Month transitions fade smoothly

### Background Animations (Your existing effects):
- Floating musical notes
- Gentle wave patterns
- Metronome pulse effect
- Click ripples with floating notes

---

## 📐 Layout Structure

### Desktop (> 768px):
- Navigation: Horizontal, centered, floating pill shape
- Calendar: 7-column grid (one week)
- Form: 2-column layout for efficiency
- Cards: 3-column grid for available slots

### Tablet (768px - 480px):
- Navigation: Collapsible hamburger menu
- Calendar: Tighter spacing, smaller cells
- Form: Single column
- Cards: 2-column grid

### Mobile (< 480px):
- Navigation: Full-width dropdown
- Calendar: Compact view
- Form: Stacked, full-width inputs
- Cards: Single column

---

## 🎯 User Flow

### For Students Signing Up:

1. Visit Calendar page → See all events
2. Click Calendar link → Check available dates  
3. Visit Signup page → See highlighted available slots
4. Fill out form → Get instant validation feedback
5. Submit → See success message
6. Check Calendar → See their name added!

### For You (Admin):

1. Student submits form
2. New row appears in your spreadsheet
3. Calendar automatically updates (if API configured)
4. You can edit/manage in spreadsheet as usual

---

## 💫 Special Touches

- **Music note animations** on every page
- **Glassmorphism cards** for modern, elegant look
- **Gold accents** throughout for consistency
- **Smooth page transitions** and animations
- **Professional form styling** with clear labels
- **Responsive design** works on all devices
- **Loading states** during form submission
- **Empty states** handled gracefully

---

## ✨ What Makes It Special

1. **Reads your exact spreadsheet format** - No need to change anything
2. **Intelligent date parsing** - Understands "Sept 13" format
3. **Groups performers automatically** - Multiple people on same date
4. **Color-coded event types** - Visual distinction
5. **Mobile-first design** - Works everywhere
6. **Maintains your theme** - Looks like it was always there
7. **Professional UX** - Clear, intuitive, beautiful

Your students will love how easy it is to see the schedule and sign up! 🎵
