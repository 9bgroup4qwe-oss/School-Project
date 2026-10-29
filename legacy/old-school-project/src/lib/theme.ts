export const theme = {
  colors: {
    primary: 'rgb(var(--color-primary) / <alpha-value>)',
    secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
    accent: 'rgb(var(--color-accent) / <alpha-value>)',
    muted: 'rgb(var(--color-muted) / <alpha-value>)',
    background: 'rgb(var(--color-background) / <alpha-value>)',
    foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
    card: 'rgb(var(--color-card) / <alpha-value>)',
    border: 'rgb(var(--color-border) / <alpha-value>)',
    input: 'rgb(var(--color-input) / <alpha-value>)',
    ring: 'rgb(var(--color-ring) / <alpha-value>)',
    destructive: 'rgb(var(--color-destructive) / <alpha-value>)',
    chart: {
      1: 'rgb(var(--color-chart-1) / <alpha-value>)',
      2: 'rgb(var(--color-chart-2) / <alpha-value>)',
      3: 'rgb(var(--color-chart-3) / <alpha-value>)',
      4: 'rgb(var(--color-chart-4) / <alpha-value>)',
      5: 'rgb(var(--color-chart-5) / <alpha-value>)',
    }
  }
};

export const courseColors = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)'
];

export const getCourseColor = (index: number) => {
  return courseColors[index % courseColors.length];
};