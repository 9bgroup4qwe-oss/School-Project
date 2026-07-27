'use client';

import React from 'react';
import Link from 'next/link';

export default function CSSTestPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('./csstest.css');
      ` }} />

      <div className="csstest-container">
        {/* Header */}
        <header className="test-header">
          <div className="header-content">
            <h1 className="page-title">CSS Testing Lab</h1>
            <p className="page-subtitle">Experiment with HSL colors and Tailwind CSS v4</p>
          </div>
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
        </header>

        {/* Control Panel */}
        <section className="control-panel">
          <h2 className="section-title">Color Controls</h2>
          <p className="section-desc">
            Modify the CSS variables in <code>csstest.css</code> to see real-time changes
          </p>
          <div className="control-hint">
            <span className="hint-key">Tip:</span>
            All colors use HSL format - change hue (0-360) to rotate colors
          </div>
        </section>

        {/* Test Grid */}
        <section className="test-grid">
          <div className="grid-title">
            <h2>Plain Card Samples</h2>
            <p>6 cards with solid black backgrounds and HSL colors</p>
          </div>

          <div className="cards-grid">
            {/* Card 1: Primary color */}
            <div className="sample-card">
              <div className="card-icon">🎨</div>
              <h3 className="card-title">Primary</h3>
              <p className="card-text">This card uses the primary HSL color scheme</p>
              <button className="sample-btn btn-primary">Primary Button</button>
            </div>

            {/* Card 2: Secondary color */}
            <div className="sample-card">
              <div className="card-icon">✨</div>
              <h3 className="card-title">Secondary</h3>
              <p className="card-text">This card uses the secondary HSL color scheme</p>
              <button className="sample-btn btn-secondary">Secondary Button</button>
            </div>

            {/* Card 3: Accent color */}
            <div className="sample-card">
              <div className="card-icon">⚡</div>
              <h3 className="card-title">Accent</h3>
              <p className="card-text">This card uses the accent HSL color scheme</p>
              <button className="sample-btn btn-accent">Accent Button</button>
            </div>

            {/* Card 4: Success color */}
            <div className="sample-card">
              <div className="card-icon">✅</div>
              <h3 className="card-title">Success</h3>
              <p className="card-text">This card uses the success HSL color scheme</p>
              <button className="sample-btn btn-success">Success Button</button>
            </div>

            {/* Card 5: Warning color */}
            <div className="sample-card">
              <div className="card-icon">⚠️</div>
              <h3 className="card-title">Warning</h3>
              <p className="card-text">This card uses the warning HSL color scheme</p>
              <button className="sample-btn btn-warning">Warning Button</button>
            </div>

            {/* Card 6: Error color */}
            <div className="sample-card">
              <div className="card-icon">❌</div>
              <h3 className="card-title">Error</h3>
              <p className="card-text">This card uses the error HSL color scheme</p>
              <button className="sample-btn btn-error">Error Button</button>
            </div>
          </div>
        </section>

        {/* Color Palette Display */}
        <section className="palette-section">
          <h2 className="section-title">HSL Color Palette</h2>
          <div className="palette-grid">
            <div className="palette-item">
              <div className="color-swatch primary-swatch"></div>
              <span className="color-label">Primary</span>
              <code className="color-value">16.76° 64.16% 66.08%</code>
            </div>
            <div className="palette-item">
              <div className="color-swatch secondary-swatch"></div>
              <span className="color-label">Secondary</span>
              <code className="color-value">215.85° 34.17% 52.94%</code>
            </div>
            <div className="palette-item">
              <div className="color-swatch accent-swatch"></div>
              <span className="color-label">Accent</span>
              <code className="color-value">220° 42.86% 56.08%</code>
            </div>
            <div className="palette-item">
              <div className="color-swatch success-swatch"></div>
              <span className="color-label">Success</span>
              <code className="color-value">184.95° 100% 38.04%</code>
            </div>
            <div className="palette-item">
              <div className="color-swatch warning-swatch"></div>
              <span className="color-label">Warning</span>
              <code className="color-value">215.85° 34.17% 52.94%</code>
            </div>
            <div className="palette-item">
              <div className="color-swatch error-swatch"></div>
              <span className="color-label">Error</span>
              <code className="color-value">0° 84.31% 60%</code>
            </div>
          </div>
        </section>

        {/* HSL Reference */}
        <section className="hsl-reference">
          <h2 className="section-title">HSL Color Reference</h2>
          <div className="reference-grid">
            <div className="ref-item">
              <h4>Hue (0-360°)</h4>
              <p>0°=Red, 60°=Yellow, 120°=Green, 180°=Cyan, 240°=Blue, 300°=Magenta</p>
            </div>
            <div className="ref-item">
              <h4>Saturation (0-100%)</h4>
              <p>0%=Gray, 100%=Full Color</p>
            </div>
            <div className="ref-item">
              <h4>Lightness (0-100%)</h4>
              <p>0%=Black, 50%=Pure Color, 100%=White</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}