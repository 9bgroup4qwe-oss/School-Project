# Layout Components

Layout components that provide structure and navigation for the application.

## Components

### Sidebar (`Sidebar.tsx`)

A fixed sidebar navigation component for desktop views with glassmorphism design.

#### Features

- **Responsive Design**: Hidden on mobile, visible on desktop (1024px+)
- **Glassmorphism Effect**: Backdrop blur with semi-transparent background
- **Navigation Items**: Main navigation and bottom settings sections
- **Active State**: Visual indication for current page
- **Hover Effects**: Smooth transitions on navigation items

#### Props

```typescript
interface SidebarProps {
  activeItem?: string;     // Currently active navigation item
  user?: SidebarUser;      // User information for display
}
```

#### Usage

```tsx
import { Sidebar } from '@/components/layout/Sidebar';

// Basic usage
<Sidebar activeItem="dashboard" />

// With custom user
<Sidebar
  activeItem="dashboard"
  user={{ name: "John Doe", handle: "@john.cosmic" }}
/>
```

#### Navigation Items

The sidebar includes the following navigation sections:

**Main Navigation (Top)**
- Dashboard - Main dashboard page
- Analytics - Data analytics (future)
- Task List - Task management (future)
- Tracking - Time tracking (future)

**Settings Navigation (Bottom)**
- Settings - Application settings
- Help Center - Documentation and support

#### Styling

The sidebar uses the following custom CSS classes:
- `.glass` - Backdrop blur effect
- `.shadow-cosmic` - Multi-layered shadow
- Responsive width: `w-64` on desktop

#### Dependencies

- `lucide-react` - Icons for navigation items
- `@/components/ui/SidebarNavItem` - Individual navigation item component
- `@/types/sidebar` - TypeScript type definitions

---

## Future Layout Components

Potential future layout components:

### Header
- Application header with logo and navigation
- Responsive mobile menu
- User profile dropdown

### Footer
- Application footer with links
- Copyright information
- Social media links

### Mobile Navigation
- Bottom navigation bar for mobile
- Slide-out menu for mobile
- Hamburger menu toggle