// app/(marketing)/landing/Landing.types.ts
export interface Badge {
  icon: 'star' | 'check-circle' | 'chart-line';
  text: string;
}

export interface Feature {
  title: string;
  description: string;
  badges?: Badge[];
  hasChart?: boolean;
  stats?: Stat[];
}

export interface Stat {
  icon: 'users' | 'clock' | 'trophy' | 'heart';
  text: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  rating: number;
  name: string;
  role: string;
}

export interface ComparisonFeature {
  feature: string;
  hasFeature: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: 'instagram' | 'twitter' | 'facebook';
  href: string;
}
