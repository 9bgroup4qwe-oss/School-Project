# Dashboard Page

A modern learning dashboard built with Next.js 15+, TypeScript, Tailwind CSS v4, and shadcn/ui components.

## Features

- **Glassmorphism Design**: Semi-transparent cards with backdrop blur effects
- **Cosmic Night Theme**: Dark theme with purple/magenta accents
- **Interactive Sidebar**: Fixed sidebar with navigation items
- **Hover Animations**: Interactive task cards with scale, translate, and shadow effects
- **Responsive Layout**: Mobile-first design with adaptive grid layouts
- **Performance Optimized**: Zero-lag rendering with proper React optimization
- **Modular Color System**: Dynamic theming using CSS custom properties

## File Structure

```
dashboard/
├── page.tsx              # Page wrapper with sidebar and layout
├── dashboard.tsx         # Main Dashboard component
├── README.md             # This documentation file
├── ../../types/
│   ├── dashboard.ts      # TypeScript type definitions
│   └── dashboard.constants.ts  # Dashboard data constants
├── ../../components/layout/
│   └── Sidebar.tsx       # Sidebar navigation component
└── ../../components/ui/
    ├── card.tsx          # Card component
    ├── button.tsx        # Button component
    ├── progress.tsx      # Progress bar component
    └── SidebarNavItem.tsx # Sidebar navigation item component
```

## Architecture

### Component Breakdown

#### Page Layout (`page.tsx`)
- Wraps the entire dashboard with a flex container
- Includes the sidebar component
- Handles responsive layout adjustments

#### Sidebar (`Sidebar.tsx`)
- Fixed width sidebar (w-64 on desktop)
- Logo section with "LearnDash" branding
- Main navigation: Dashboard, Analytics, Task List, Tracking
- Bottom navigation: Settings, Help Center
- Hidden on mobile for responsive design

#### Dashboard (`dashboard.tsx`)
The main component composed of 4 sub-components:

1. **CourseCard** - Displays course progress with a progress bar
2. **TaskCard** - Shows daily tasks with hover animations
3. **CalendarEventItem** - Renders calendar events with date and time
4. **StatCard** - Statistics display with optional highlight

### Data Flow

1. **Type Definitions** (`types/dashboard.ts`)
   - `Course` - Course information with progress tracking
   - `TodayTask` - Task details with duration and course
   - `CalendarEvent` - Calendar events with date, time, and type
   - `Statistics` - User statistics and plan info
   - `DashboardData` - Main data interface combining all types
   - `SidebarUser` - User information for sidebar

2. **Data Store** (`types/dashboard.constants.ts`)
   - `DASHBOARD_DATA` - Static data object
   - Uses theme colors from `@/lib/theme`
   - Modular color system for easy theme switching

3. **Theme System** (`lib/theme.ts`)
   - Exports all CSS custom properties
   - `getCourseColor()` helper for dynamic color assignment
   - No hardcoded colors - fully modular

### Styling

#### Custom Classes

- **`.glass`** - Backdrop blur with semi-transparent background
- **`.shadow-cosmic`** - Multi-layered shadow with purple glow effect

#### Tailwind CSS v4 Configuration

The dashboard uses Tailwind CSS v4 with custom theme defined in `globals.css`:

```css
@theme {
  --color-background: rgb(15 15 26);
  --color-foreground: rgb(226 226 245);
  --color-primary: rgb(164 143 255);
  --color-secondary: rgb(45 43 85);
  --color-accent: rgb(48 48 96);
  /* ... more colors */
}
```

## Dependencies

### UI Components
- `@/components/ui/card` - shadcn/ui Card component
- `@/components/ui/button` - shadcn/ui Button component
- `@/components/ui/progress` - Custom Progress component (Radix UI based)
- `@/components/ui/SidebarNavItem` - Sidebar navigation item

### External Libraries
- `@radix-ui/react-progress` - Progress bar primitive
- `@radix-ui/react-slot` - Button slot primitive
- `class-variance-authority` - Component variant management
- `tailwind-merge` - Tailwind class merging utility
- `lucide-react` - Icon library

## Usage

### Accessing the Dashboard

Navigate to `/dashboard` in your browser.

### Sidebar Navigation

The sidebar supports the following navigation items:
- **Dashboard** - Current page (active state highlighted)
- **Analytics** - Future analytics page
- **Task List** - Future task management page
- **Tracking** - Future time tracking page
- **Settings** - Settings page (bottom section)
- **Help Center** - Help documentation (bottom section)

### Modifying Theme

1. Update CSS custom properties in `globals.css`
2. All components will automatically use the new theme

### Adding New Data

1. Update `DASHBOARD_DATA` in `types/dashboard.constants.ts`
2. Ensure type definitions match in `types/dashboard.ts`

### Customizing Components

Each component is modular and can be customized:

```tsx
// Example: Customizing CourseCard
const CourseCard = ({ course, customClass }: { course: Course; customClass?: string }) => (
  <Card className={`glass rounded-xl p-6 ${customClass}`}>
    {/* Component content */}
  </Card>
);
```

## Performance Considerations

1. **Client Component** - Marked as 'use client' for interactivity
2. **Static Data** - No API calls for initial load
3. **Optimized Imports** - Components imported individually
4. **GPU Acceleration** - transform: translateZ(0) for smooth animations
5. **CSS Containment** - Contain property for better rendering performance

## Responsive Design

- **Mobile** (< 1024px): Sidebar hidden, single column layout
- **Tablet** (1024px+): Sidebar visible, two column layout for tasks
- **Desktop** (> 1024px): Full three-column grid layout with sidebar

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: Uses `backdrop-filter` for glassmorphism - may require prefixes for older browsers.

## Future Enhancements

1. **Dynamic Data** - Integration with backend API
2. **Real-time Updates** - WebSocket integration for live updates
3. **Collapsible Sidebar** - Toggle sidebar visibility on desktop
4. **Dark/Light Mode** - Theme switching capability
5. **Data Persistence** - LocalStorage or database integration
6. **Advanced Animations** - Framer Motion integration
7. **Charts/Graphs** - Visual statistics representation
8. **Search Functionality** - Global search in sidebar
9. **User Profile** - User avatar and profile in sidebar
10. **Notifications** - Notification badge in sidebar