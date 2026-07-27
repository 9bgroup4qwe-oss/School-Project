'use client';

export default function GradientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/70 to-secondary" />
    </div>
  );
}