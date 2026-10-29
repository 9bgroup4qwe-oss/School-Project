'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, Check } from 'lucide-react';

interface ChapterListProps {
  subject: {
    id: string;
    name: string;
    icon: string;
    description: string;
  } | undefined;
  chapters: string[];
  selectedChapters: string[];
  onChaptersChange: (chapters: string[]) => void;
}

export function ChapterList({ subject, chapters, selectedChapters, onChaptersChange }: ChapterListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAllSelected, setIsAllSelected] = useState(false);

  const filteredChapters = chapters.filter(chapter =>
    chapter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setIsAllSelected(filteredChapters.length > 0 && selectedChapters.length === filteredChapters.length);
  }, [selectedChapters, filteredChapters]);

  const handleToggleChapter = (chapter: string) => {
    if (selectedChapters.includes(chapter)) {
      onChaptersChange(selectedChapters.filter(c => c !== chapter));
    } else {
      onChaptersChange([...selectedChapters, chapter]);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChaptersChange([]);
    } else {
      onChaptersChange(filteredChapters);
    }
  };

  return (
    <div className="chapter-list-container">
      <div className="chapter-list-content">
        {/* Subject Info */}
        <div className="subject-info">
          <div className="subject-icon-large">
            <span>{subject?.icon}</span>
          </div>
          <div>
            <h2 className="subject-title">{subject?.name}</h2>
            <p className="subject-subtitle">{subject?.description}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="chapter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            onClick={handleSelectAll}
            className="select-all-button"
          >
            <div className={`checkbox ${isAllSelected ? 'checked' : ''}`}>
              {isAllSelected && <Check size={16} />}
            </div>
            <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>

        {/* Chapters List */}
        <div className="chapters-list">
          {filteredChapters.map((chapter, index) => {
            const isSelected = selectedChapters.includes(chapter);

            return (
              <div
                key={chapter}
                className={`chapter-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleChapter(chapter)}
              >
                <div className="chapter-checkbox">
                  <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <Check size={14} />}
                  </div>
                </div>

                <div className="chapter-number">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>

                <div className="chapter-content">
                  <h4 className="chapter-name">{chapter}</h4>
                  <div className="chapter-meta">
                    <BookOpen size={14} />
                    <span>~15 questions</span>
                  </div>
                </div>

                <div className="chapter-item-overlay"></div>
              </div>
            );
          })}
        </div>

        {/* Selection Summary */}
        <div className="selection-summary">
          <p>
            {selectedChapters.length === 0
              ? 'No chapters selected'
              : `${selectedChapters.length} chapter${selectedChapters.length === 1 ? '' : 's'} selected`
            }
          </p>
        </div>
      </div>
    </div>
  );
}