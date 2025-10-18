# Enhanced Animations Guide

## Overview
The UOttawa Pre-College website now features a comprehensive set of modern, smooth animations that enhance user experience and visual appeal.

## Animation Features

### 1. **Page Load Animations**
- **Body Fade-In**: Smooth fade-in effect when any page loads (0.5s)
- **Navbar Slide-In**: Navigation bar slides down from the top (0.6s)
- **Hero Title Typing Effect**: On the home page, the hero title types out character by character

### 2. **Hero Section Effects**
- **Gradient Animation**: Background gradient shifts smoothly across the hero section (15s loop)
- **Parallax Scrolling**: Hero section moves at a different speed when scrolling, creating depth
- **Floating Particles**: 30 animated particles float upward through the hero section
- **Hero Content Stagger**: Title, subtitle, and buttons fade in sequentially with delays

### 3. **Navigation Animations**
- **Link Hover**: Navigation links lift up slightly on hover with smooth transitions
- **Active Underline**: Active page link has an animated underline that expands from center
- **Scroll Shadow**: Navbar shadow intensifies as you scroll down the page
- **Mobile Menu**: Hamburger icon transforms into an X with smooth rotation

### 4. **Scroll Progress Indicator**
- **Top Bar**: A gradient progress bar at the top of the page shows scroll position
- **Smooth Updates**: Updates in real-time as you scroll with smooth transitions

### 5. **Section Title Animations**
- **Animated Underline**: Section titles have an expanding gradient underline (1s)
- **Gradient Effect**: Underline uses primary to accent color gradient

### 6. **Feature Card Animations**
- **Staggered Fade-In**: Cards appear one after another with 0.15s delays
- **Floating Icons**: Icons continuously float up and down (3s loop, staggered delays)
- **Hover Lift**: Cards lift up 10px on hover with enhanced shadow
- **Link Bounce**: "Learn more" links bounce horizontally on hover

### 7. **Button Animations**
- **Primary Button Shimmer**: Light shimmer effect sweeps across on hover
- **Secondary Button Glow**: Glowing effect with scale transformation on hover
- **Lift Effect**: Both buttons lift slightly on hover with enhanced shadows

### 8. **Content Card Animations**
- **Scale Fade-In**: Cards scale up from 95% to 100% as they enter viewport
- **Ripple Effect**: Circular ripple expands from center on hover
- **Staggered Appearance**: Multiple cards appear with 0.1s delays between them

### 9. **Student Card Animations**
- **Alternating Direction**: Cards slide in from left and right alternately
- **Rotation Hover**: Cards rotate 1° and lift on hover
- **Enhanced Shadow**: Colored shadow (primary color) appears on hover
- **Staggered Timing**: 0.1s delay between each card appearance

### 10. **Back to Top Button**
- **Fade In/Out**: Appears after scrolling 300px down
- **Rotation Hover**: Rotates 360° and scales up 10% on hover
- **Smooth Scroll**: Clicking triggers smooth scroll to top
- **Gradient Background**: Uses primary to accent color gradient

### 11. **Interactive Effects**
- **Cubic Bezier Transitions**: Bouncy easing for interactive elements
- **Navigation Link Transform**: Links transform on hover with smooth transitions
- **Footer Link Fade**: Footer links fade in opacity on hover

## Animation Timing

### Fast Animations (0.3s)
- Button hovers
- Link transitions
- Basic transforms

### Medium Animations (0.6s - 0.8s)
- Card fade-ins
- Content reveals
- Page transitions

### Slow Animations (1s+)
- Section title underlines
- Gradient shifts
- Floating effects

### Continuous Animations
- Particle floating (10-20s)
- Icon floating (3s)
- Gradient shift (15s)

## Performance Optimizations

1. **CSS Transforms**: All animations use CSS transforms for GPU acceleration
2. **Will-Change**: Critical animations use will-change property
3. **Intersection Observer**: Animations only trigger when elements are visible
4. **Staggered Loading**: Elements load progressively to avoid overwhelming the browser
5. **Conditional Effects**: Particles only created on pages with hero sections

## Browser Compatibility

All animations are designed to work on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Fallbacks are in place for older browsers that don't support certain features.

## Customization

To adjust animation speeds, modify these values in `styles.css`:
- `--transition: all 0.3s ease;` (global transition speed)
- Individual animation durations in keyframes
- Delay values in JavaScript for staggered effects

To disable specific animations:
- Comment out the relevant JavaScript functions
- Remove animation properties from CSS classes
- Set animation-duration to 0s

## Accessibility

- All animations respect `prefers-reduced-motion` media query
- Animations don't interfere with keyboard navigation
- Focus states are clearly visible
- No flashing or rapid movements that could trigger seizures
