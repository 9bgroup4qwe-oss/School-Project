# Theme System

A centralized theme management system for the learning application that provides modular color management and consistent theming across all components.

## Overview

The theme system ensures no hardcoded colors are used throughout the application, enabling easy theme switching and consistent design patterns. All colors are sourced from CSS custom properties defined in the global stylesheet.

## Features

- **Modular Color System**: All colors exported from a central location
- **CSS Custom Properties**: Theme colors defined in `globals.css`
- **Dynamic Color Assignment**: Helper functions for automatic color selection
- **TypeScript Support**: Full type safety for all color values
- **Performance Optimized**: No runtime color calculations

## File Structure

```
lib/
├── theme.ts      # Central theme exports and color utilities
└── README.md     # This documentation file
```

## API Reference

### Color Exports

All colors are available as CSS custom property strings:

```typescript
export const theme = {
  colors: {
    // Primary colors
    primary: 'rgb(var(--color-primary) / <alpha-value>)',
    'primary-foreground': 'rgb(var(--color-primary-foreground) / <alpha-value>)',

    // Secondary colors
    secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
    'secondary-foreground': 'rgb(var(--color-secondary-foreground) / <alpha-value>)',

    // Background colors
    background: 'rgb(var(--color-background) / <alpha-value>)',
    foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
    card: 'rgb(var(--color-card) / <alpha-value>)',
    'card-foreground': 'rgb(var(--color-card-foreground) / <alpha-value>)',

    // Accent colors
    accent: 'rgb(var(--color-accent) / <alpha-value>)',
    'accent-foreground': 'rgb(var(--color-accent-foreground) / <alpha-value>)',

    // Muted colors
    muted: 'rgb(var(--color-muted) / <alpha-value>)',
    'muted-foreground': 'rgb(var(--color-muted-foreground) / <alpha-value>)',

    // Destructive colors
    destructive: 'rgb(var(--color-destructive) / <alpha-value>)',
    'destructive-foreground': 'rgb(var(--color-destructive-foreground) / <alpha-value>)',

    // Border and input colors
    border: 'rgb(var(--color-border) / <alpha-value>)',
    input: 'rgb(var(--color-input) / <alpha-value>)',
    ring: 'rgb(var(--color-ring) / <alpha-value>)',

    // Chart colors
    'chart-1': 'rgb(var(--color-chart-1) / <alpha-value>)',
    'chart-2': 'rgb(var(--color-chart-2) / <alpha-value>)',
    'chart-3': 'rgb(var(--color-chart-3) / <alpha-value>)',
    'chart-4': 'rgb(var(--color-chart-4) / <alpha-value>)',
    'chart-5': 'rgb(var(--color-chart-5) / <alpha-value>)',
  }
};
```

### Helper Functions

#### getCourseColor

Automatically assigns colors to courses based on index:

```typescript
export const getCourseColor = (index: number): string => {
  const courseColors = [
    'rgb(var(--color-chart-1))',
    'rgb(var(--color-chart-2))',
    'rgb(var(--color-chart-3))',
    'rgb(var(--color-chart-4))',
    'rgb(var(--color-chart-5))',
  ];
  return courseColors[index % courseColors.length];
};
```

#### getThemeColor

Generic helper to get any theme color:

```typescript
export const getThemeColor = (colorName: keyof typeof theme.colors, alpha: number = 1): string => {
  const color = theme.colors[colorName];
  return color.replace('<alpha-value>', alpha.toString());
};
```

## CSS Custom Properties

The theme system relies on CSS custom properties defined in `globals.css`:

```css
@theme {
  /* Background Colors */
  --color-background: rgb(15 15 26);
  --color-foreground: rgb(226 226 245);
  --color-card: rgb(26 26 46);
  --color-card-foreground: rgb(226 226 245);
  --color-popover: rgb(26 26 46);
  --color-popover-foreground: rgb(226 226 245);

  /* Primary Colors */
  --color-primary: rgb(164 143 255);
  --color-primary-foreground: rgb(15 15 26);

  /* Secondary Colors */
  --color-secondary: rgb(45 43 85);
  --color-secondary-foreground: rgb(196 194 255);

  /* Muted Colors */
  --color-muted: rgb(34 34 68);
  --color-muted-foreground: rgb(160 160 192);

  /* Accent Colors */
  --color-accent: rgb(48 48 96);
  --color-accent-foreground: rgb(226 226 245);

  /* Destructive Colors */
  --color-destructive: rgb(255 84 112);
  --color-destructive-foreground: rgb(255 255 255);

  /* Border and Input Colors */
  --color-border: rgb(48 48 82);
  --color-input: rgb(48 48 82);
  --color-ring: rgb(164 143 255);

  /* Chart Colors */
  --color-chart-1: rgb(164 143 255);
  --color-chart-2: rgb(121 134 203);
  --color-chart-3: rgb(100 181 246);
  --color-chart-4: rgb(77 182 172);
  --color-chart-5: rgb(255 121 198);
}
```

## Usage Examples

### In Components

```tsx
import { theme, getCourseColor, getThemeColor } from '@/lib/theme';

// Using theme colors directly
<div style={{ backgroundColor: theme.colors.primary }}>
  Primary color background
</div>

// Using helper for alpha transparency
<div style={{ backgroundColor: getThemeColor('primary', 0.1) }}>
  10% opacity primary
</div>

// Automatic color assignment for dynamic data
{courses.map((course, index) => (
  <Card key={course.id} style={{ borderColor: getCourseColor(index) }}>
    {course.title}
  </Card>
))}
```

### In Constants

```typescript
// dashboard.constants.ts
import { getCourseColor } from '@/lib/theme';

export const DASHBOARD_DATA = {
  courses: [
    {
      id: '1',
      title: 'React Fundamentals',
      color: getCourseColor(0), // Uses chart-1 color
    },
    {
      id: '2',
      title: 'TypeScript Mastery',
      color: getCourseColor(1), // Uses chart-2 color
    },
  ]
};
```

### In Styled Components

```tsx
// With Tailwind classes
<button className="bg-primary text-primary-foreground">
  Button with theme colors
</button>

// With inline styles for dynamic values
<div
  className="glass rounded-xl p-6"
  style={{
    backgroundColor: getThemeColor('card', 0.8),
    borderColor: getThemeColor('border', 0.5)
  }}
>
  Glass card with theme colors
</div>
```

## Design System Integration

The theme system integrates with the custom design system variables:

```css
/* Landing Page Design System */
--card-radius: 0.75rem;
--shadow-cosmic: rgba(15, 12, 41, 0.3);
--glass-violet: rgba(158, 127, 185, 0.1);
--glass-blur: 10px;
--text-shadow-primary: 0 2px 4px var(--shadow-cosmic);
--text-shadow-secondary: 0 1px 2px var(--shadow-cosmic);
```

## Best Practices

1. **Never Hardcode Colors**: Always import from the theme system
2. **Use Semantic Names**: Prefer semantic color names (primary, destructive) over literal colors (blue, red)
3. **Maintain Contrast**: Ensure text colors provide sufficient contrast against backgrounds
4. **Alpha Transparency**: Use the `<alpha-value>` placeholder for opacity
5. **Consistent Usage**: Use the same color for similar UI elements throughout the app

## Theme Customization

To customize the theme:

1. Update CSS custom properties in `globals.css`
2. All components using the theme system will automatically reflect changes
3. No component-level changes required

Example theme customization:

```css
/* Light theme variant */
@theme {
  --color-background: rgb(255 255 255);
  --color-foreground: rgb(15 15 26);
  --color-primary: rgb(59 130 246);
  --color-primary-foreground: rgb(255 255 255);
}
```

## Future Enhancements

1. **Theme Variants**: Support for multiple predefined themes (light, dark, high contrast)
2. **Dynamic Theme Switching**: Runtime theme switching with persistence
3. **Color Generator**: Automatic color palette generation from primary color
4. **Accessibility Features**: Built-in contrast ratio checking
5. **CSS Variables Runtime**: Dynamic CSS variable manipulation
6. **Theme Validation**: TypeScript validation for theme completeness
7. **Export Utilities**: Helper to export theme as CSS/JSON
8. **Animation Presets**: Theme-consistent animation definitions