// app/(marketing)/landing/page.tsx
import type { Metadata } from 'next';
import Landing from './Landing';

export const metadata: Metadata = {
  title: 'GrowMyIQ - Learning Re-invented',
  description:
    'Revolutionising learning with artificial intelligence, GrowMyIQ is the best way to learn in the 21st century.',
  openGraph: {
    title: 'GrowMyIQ - Learning Re-invented',
    description:
      'Revolutionising learning with artificial intelligence, GrowMyIQ is the best way to learn in the 21st century.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrowMyIQ - Learning Re-invented',
    description:
      'Revolutionising learning with artificial intelligence, GrowMyIQ is the best way to learn in the 21st century.',
  },
};

export default function LandingPage() {
  return <Landing />;
}
