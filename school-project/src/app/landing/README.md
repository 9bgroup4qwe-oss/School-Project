# Landing Page

A modern marketing landing page built with Next.js 15+, TypeScript, Tailwind CSS v4, and shadcn/ui components, featuring glassmorphism design and cosmic theme effects.

## Features

- **Glassmorphism Design**: Semi-transparent cards with backdrop blur effects
- **Cosmic Night Theme**: Dark theme with purple/magenta accents
- **Interactive Elements**: Hover animations and transitions
- **Responsive Layout**: Mobile-first design with adaptive grid layouts
- **Performance Optimized**: 60fps animations with GPU acceleration
- **Modular Color System**: Dynamic theming using CSS custom properties
- **Component-Based Architecture**: Modular sections using shadcn/ui

## File Structure

```
landing/
├── page.tsx              # Main landing page component
├── Landing.tsx           # Landing page implementation
├── Landing.types.ts      # TypeScript type definitions
├── Landing.constants.ts  # Landing page data and content
├── README.md             # This documentation file
└── ../../lib/
    └── theme.ts          # Theme system and color exports
```

## Architecture

### Component Breakdown

The landing page consists of the following sections:

1. **Hero Section** - Main call-to-action area with title, description, and CTA button
2. **Features Sections** - Two rows of feature cards showcasing platform capabilities
3. **Benefits Section** - Three key benefits with icons
4. **Testimonials Section** - User testimonials with ratings
5. **Comparison Section** - Side-by-side comparison with traditional learning
6. **FAQ Section** - Accordion-style frequently asked questions
7. **CTA Section** - Final call-to-action with mobile preview placeholder
8. **Footer** - Navigation links and social media

### Data Structure

#### Type Definitions (`Landing.types.ts`)

```typescript
export interface Badge {
  icon: 'star' | 'check-circle' | 'chart-line' | 'users' | 'clock' | 'trophy' | 'heart';
  text: string;
}

export interface Feature {
  title: string;
  description: string;
  badges?: Badge[];
  stats?: Array<{ icon: string; text: string }>;
  hasChart?: boolean;
}

export interface Testimonial {
  quote: string;
  rating: number;
  name: string;
  role: string;
}

export interface FAQ {
  question: string;
  answer?: string;
}
```

#### Content Store (`Landing.constants.ts`)

All content is centralized in the constants file:
- Navigation links
- Hero section content
- Features and benefits data
- Testimonials and comparison data
- FAQ items
- CTA and footer content

### Styling System

#### Custom CSS Classes

The landing page uses the following custom classes defined in `globals.css`:

```css
/* Glassmorphism Effects */
.feature-card {
  background: var(--glass-violet);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--card-radius);
  box-shadow: 0 2px 4px var(--shadow-cosmic),
              0 8px 16px rgba(15, 12, 41, 0.15);
}

.benefit-card {
  border-radius: var(--card-radius);
  box-shadow: 0 2px 4px var(--shadow-cosmic),
              0 12px 32px rgba(15, 12, 41, 0.1);
}

.testimonial-card {
  background: var(--glass-violet);
  backdrop-filter: blur(8px);
  border-radius: var(--card-radius);
}

/* Typography Effects */
.text-shadow-primary {
  text-shadow: var(--text-shadow-primary);
}

/* CTA Button */
.cta-button {
  box-shadow: 0 4px 12px var(--shadow-cosmic),
              0 0 24px rgba(158, 127, 185, 0.2);
  transition: all 0.2s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--shadow-cosmic),
              0 0 32px rgba(158, 127, 185, 0.3);
}
```

#### Design Tokens

CSS custom properties for consistent theming:

```css
:root {
  --card-radius: 0.75rem;
  --shadow-cosmic: rgba(15, 12, 41, 0.3);
  --glass-violet: rgba(158, 127, 185, 0.1);
  --glass-blur: 10px;
  --text-shadow-primary: 0 2px 4px var(--shadow-cosmic);
  --text-shadow-secondary: 0 1px 2px var(--shadow-cosmic);
}
```

### Performance Optimizations

1. **GPU Acceleration**:
   - `transform: translateZ(0)` on animated elements
   - `will-change: transform` for smooth animations

2. **CSS Containment**:
   - `contain: layout style paint` on cards
   - Reduces layout recalculations

3. **Backdrop Filter Limits**:
   - Limited to 6 glassmorphism elements for 60fps performance
   - Only applies to feature and testimonial cards

4. **Fallback Support**:
   - Fallback background colors for browsers without backdrop-filter
   - Graceful degradation for older browsers

## Dependencies

### UI Components

- `@/components/ui/card` - shadcn/ui Card component
- `@/components/ui/button` - shadcn/ui Button component
- `@/components/ui/accordion` - shadcn/ui Accordion component

### External Libraries

- `lucide-react` - Icon library (Star, CheckCircle, etc.)
- `class-variance-authority` - Component variant management
- `tailwind-merge` - Tailwind class merging utility

## Usage

### Modifying Content

1. Update `Landing.constants.ts` for text changes
2. Update `Landing.types.ts` for structural changes

### Customizing Styling

1. Update CSS custom properties in `globals.css`
2. All components will automatically use the new theme

### Adding New Sections

1. Create new component in `Landing.tsx`
2. Add type definitions to `Landing.types.ts`
3. Add content to `Landing.constants.ts`

### Customizing Animations

```tsx
// Example: Customizing hover effects
<Card className="feature-card transition-all duration-300 hover:scale-[1.02]">
  {/* Content */}
</Card>
```

## Responsive Design

- **Mobile** (< 768px): Single column layout
- **Tablet** (768px+): Two column layout for features
- **Desktop** (> 1024px): Full layout with proper spacing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: Uses `backdrop-filter` for glassmorphism - includes fallbacks for older browsers.

## SEO Considerations

- Semantic HTML5 structure
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images (when added)
- Descriptive link text

## Future Enhancements

1. **Mobile App Preview**: Replace placeholder with actual preview
2. **Micro-interactions**: Subtle animations on user interactions
3. **A/B Testing**: Variant system for different CTA texts
4. **Video Background**: Optional video in hero section
5. **Newsletter Signup**: Integration with email service
6. **Live Chat**: Customer support widget
7. **Progressive Web App**: PWA features for mobile users
8. **Internationalization**: Multi-language support
9. **Analytics Integration**: Event tracking for user behavior
10. **Social Proof**: Real-time notifications or counter