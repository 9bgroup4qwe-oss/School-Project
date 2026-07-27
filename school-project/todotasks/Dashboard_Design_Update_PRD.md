# Dashboard Design Update PRD

## Project Overview
**Product**: Learning App Dashboard Redesign
**Version**: 1.0
**Date**: October 8, 2025
**Status**: Ready for Development

## 1. Introduction

### 1.1 Purpose
This PRD outlines the design update requirements for the Learning App dashboard to align with the new dark theme and color palette established in the authentication page.

### 1.2 Current State
- Dashboard uses glassmorphism effects with light/transparent backgrounds
- Color scheme based on CSS variables with light tones
- Typography using system fonts
- Cards have `glass` class with subtle shadows

### 1.3 Target State
- Dark theme matching auth page aesthetic
- Gradient backgrounds and improved contrast
- Montserrat & Inter typography
- Enhanced visual hierarchy
- Consistent with colorreference.html design system

## 2. Design System Migration

### 2.1 Color Palette (from auth page)

**Primary Colors:**
- Background: `#1e1e1e` (dark)
- Primary Text: `#f9f9f9` (light gray)
- Secondary Text: `hsl(0_0%_60%)` (muted gray)
- Yellow Accent: `#ffe537` (buttons, highlights)
- Blue Accent: `#537fe7` (links, active states)

**Gradients:**
- Card Background: `linear-gradient(45deg, hsl(0, 0%, 20%), hsl(0, 0%, 15%))`
- Background Decor: Radial gradients with blue/purple accents
- Button Hover: Enhanced shadow with accent colors

### 2.2 Typography

**Font Families:**
- Headers: Montserrat (bold weights)
- Body Text: Inter (regular/medium weights)
- Font Sizes: Using clamp() for responsive typography

**Typography Scale:**
- H1: `bold clamp(2.5rem, 3vw, 3.5rem)`
- H2: `bold clamp(2rem, 2.5vw, 3rem)`
- H3: `bold clamp(1.5rem, 2vw, 2rem)`
- Body: `1rem/1.8em Inter`
- Small: `0.875rem/1.6em Inter`

### 2.3 Visual Effects

**Transitions:**
- Default: `all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)`
- Hover: Transform translateY effects
- Active: Scale and shadow enhancements

**Shadows:**
- Default: `0 10px 20px rgba(0, 0, 0, 0.4)`
- Hover: `0 20px 40px rgba(0, 0, 0, 0.6)`
- Button: `0 5px 15px rgba(255, 229, 55, 0.3)`

**Border Radius:**
- Small: `12px`
- Medium: `12px`
- Large: `20px`

## 3. Component Updates

### 3.1 Dashboard Layout

**File: `/src/app/dashboard/page.tsx`**
- Update background to `#1e1e1e`
- Add gradient decorations
- Update spacing and padding

### 3.2 Sidebar Component

**File: `/src/components/layout/Sidebar.tsx`**
- Replace glass effect with gradient background
- Update logo and text colors
- Enhance hover states
- Add visual depth

**Changes Required:**
```css
.sidebar {
  background: var(--graygradient);
  box-shadow: var(--shadow);
  border: 1px solid hsl(0_0%_25%);
}

.sidebar-logo {
  color: var(--colorp);
  font-family: var(--ff);
}

.sidebar-nav-item:hover {
  transform: translateY(-1px);
}
```

### 3.3 Dashboard Main Component

**File: `/src/app/dashboard/dashboard.tsx`**

**Header Section:**
- Update greeting text with Montserrat font
- Change "Start Learning" button to yellow accent
- Add gradient background decoration

**Course Cards:**
- Remove glass effect
- Apply gradient backgrounds
- Update progress bar colors
- Enhance hover animations

**Task Cards:**
- Redesign with dark theme
- Use blue accent for tags
- Add scale transform on hover

**Statistics Cards:**
- Apply gradient background
- Highlight premium card with special effects
- Update number colors to primary text

**Calendar Section:**
- Darker background for events
- Better contrast for times
- Update border colors

### 3.4 New CSS Variables to Add

Create or update `/src/app/dashboard/dashboard.css`:
```css
:root {
  /* Import from auth page */
  --ff: "Montserrat", sans-serif;
  --ff-inter: "Inter", sans-serif;
  --colorp: #f9f9f9;
  --colora: #ffe537;
  --colora2: #537fe7;
  --colorbody: #1e1e1e;
  --colorgray: hsl(0_0%_60%);

  /* Dashboard specific */
  --dashboard-gradient: radial-gradient(circle at 20% 50%, hsla(217_91%_60%_/_5%) 0%, transparent 50%);
  --card-gradient: linear-gradient(45deg, hsl(0_0%_20%), hsl(0_0%_15%));
  --progress-bg: hsl(0_0%_25%);
  --progress-fill: var(--colora);
}
```

## 4. Implementation Tasks

### 4.1 Phase 1: Setup & Base Styles
1. Create/update dashboard.css with new design system
2. Import Inter and Montserrat fonts
3. Add CSS variables to global scope
4. Update main dashboard layout background

### 4.2 Phase 2: Component Updates
1. Update Sidebar component styling
2. Redesign Course cards
3. Redesign Task cards
4. Update Statistics section
5. Update Calendar section
6. Update header section

### 4.3 Phase 3: Interactions & Animations
1. Add hover states to all interactive elements
2. Implement smooth transitions
3. Add loading states if needed
4. Ensure accessibility with focus states

### 4.4 Phase 4: Responsive Design
1. Test on mobile devices
2. Adjust typography scales
3. Update grid layouts for smaller screens
4. Ensure touch targets are appropriate

## 5. Specific Code Changes

### 5.1 Remove Glass Classes
Replace all instances of `className="glass"` with new dark theme classes.

### 5.2 Update Card Components
Before:
```jsx
<Card className="glass rounded-xl p-6 border-border/50 shadow-cosmic">
```

After:
```jsx
<Card className="dark-card rounded-xl p-6 border-dark-border shadow-dark">
```

### 5.3 Update Button Styles
Before:
```jsx
<Button className="bg-primary text-primary-foreground">
```

After:
```jsx
<Button className="accent-button">
```

### 5.4 Typography Updates
Before:
```jsx
<h2 className="text-3xl font-extrabold text-foreground">
```

After:
```jsx
<h2 className="dashboard-title">
```

## 6. CSS Implementation

### 6.1 New CSS Classes to Create

```css
/* Dashboard Container */
.dashboard-container {
  background: var(--colorbody);
  color: var(--colorp);
  font: var(--p);
  position: relative;
  overflow: hidden;
}

.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--dashboard-gradient);
  pointer-events: none;
}

/* Dark Card */
.dark-card {
  background: var(--card-gradient);
  border: 1px solid hsl(0_0%_25%);
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.dark-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

/* Accent Button */
.accent-button {
  background: var(--colora);
  color: #000;
  border: 1px solid var(--colora);
  padding: 14px 24px;
  border-radius: 12px;
  font: var(--p);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: var(--transition);
  box-shadow: 0 5px 15px rgba(255, 229, 55, 0.3);
}

.accent-button:hover {
  background: #fff5cc;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 229, 55, 0.4);
}

/* Typography Classes */
.dashboard-title {
  font: var(--h1);
  color: var(--colorp);
  margin-bottom: 0.5rem;
}

.card-title {
  font: var(--h3);
  color: var(--colorp);
  margin-bottom: 1rem;
}

/* Progress Bar */
.progress-bar {
  background: var(--progress-bg);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  background: var(--progress-fill);
  height: 100%;
  transition: width 0.3s ease;
}

/* Stat Card */
.stat-card {
  text-align: center;
  padding: 2rem;
}

.stat-value {
  font: var(--h2);
  color: var(--colora);
  font-weight: bold;
}

.stat-label {
  font: var(--small);
  color: var(--colorgray);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.5rem;
}
```

## 7. Testing Checklist

- [ ] All text is readable with new color scheme
- [ ] Hover states work on all interactive elements
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Color contrast meets WCAG AA standards
- [ ] Animations are smooth and performant
- [ ] No broken layouts
- [ ] Focus states for accessibility
- [ ] Loading states display correctly

## 8. Success Metrics

1. **Visual Consistency**: Dashboard matches auth page aesthetic
2. **User Experience**: Improved readability and visual hierarchy
3. **Performance**: No performance regression
4. **Accessibility**: Meets WCAG AA standards
5. **Responsiveness**: Works across all device sizes

## 9. Timeline Estimate

- **Phase 1**: Setup & Base Styles - 2 hours
- **Phase 2**: Component Updates - 4 hours
- **Phase 3**: Interactions & Animations - 2 hours
- **Phase 4**: Testing & Refinement - 1 hour

**Total Estimated Time**: 9 hours

## 10. Deliverables

1. Updated dashboard with new dark theme
2. CSS file with all new styles
3. Component file updates
4. Responsive design adjustments
5. Documentation of any breaking changes

---

## Acceptance Criteria

1. Dashboard uses dark theme matching auth page
2. All components updated with new color palette
3. Typography uses Montserrat/Inter fonts
4. Hover states and transitions implemented
5. Design is responsive across devices
6. No functionality broken
7. Ready for user testing

## Contact Information

**Product Manager**: [Your Name]
**Developer**: [To be assigned]
**Review Date**: [To be determined]