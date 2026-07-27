'use client';

import { useState } from 'react';
import { getCourseColor } from '@/lib/theme';

interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface SubjectGridProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectSelect: (subjectId: string) => void;
}

export function SubjectGrid({ subjects, selectedSubject, onSubjectSelect }: SubjectGridProps) {
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);

  return (
    <div className="subject-grid-container">
      <div className="subject-grid">
        {subjects.map((subject, index) => {
          const isSelected = selectedSubject === subject.id;
          const isHovered = hoveredSubject === subject.id;
          const courseColor = getCourseColor(index);

          return (
            <div
              key={subject.id}
              className={`subject-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={() => onSubjectSelect(subject.id)}
              onMouseEnter={() => setHoveredSubject(subject.id)}
              onMouseLeave={() => setHoveredSubject(null)}
              style={{
                '--course-color': courseColor,
                '--course-color-light': `${courseColor}20`,
                '--course-color-glow': `${courseColor}40`,
              } as React.CSSProperties}
            >
              {/* Selection Ring */}
              <div className="selection-ring"></div>

              {/* Icon Container */}
              <div className="subject-icon-container">
                <span
                  className="subject-icon"
                  style={{
                    background: `linear-gradient(135deg, var(--course-color), var(--course-color-light))`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {subject.icon}
                </span>
                {isSelected && (
                  <div className="selected-badge">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="var(--colora2)"/>
                      <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="subject-content">
                <h3 className="subject-name">{subject.name}</h3>
                <p className="subject-description">{subject.description}</p>
              </div>

              {/* Hover Effect Overlay */}
              <div className="subject-card-overlay"></div>
            </div>
          );
        })}
      </div>

      <div className="subject-grid-footer">
        <p className="selection-hint">
          {selectedSubject ? (
            <>
              <span className="highlight-text">{subjects.find(s => s.id === selectedSubject)?.name}</span> selected
            </>
          ) : (
            'Select a subject to continue'
          )}
        </p>
      </div>
    </div>
  );
}