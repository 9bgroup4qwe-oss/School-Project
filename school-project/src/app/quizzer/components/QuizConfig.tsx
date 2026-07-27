'use client';

import { useState } from 'react';
import { Zap, Target, Trophy, Clock } from 'lucide-react';

interface QuizData {
  subject: string;
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

interface QuizConfigProps {
  quizData: QuizData;
  onDataChange: (data: QuizData) => void;
}

const difficultyOptions = [
  {
    value: 'easy',
    label: 'Easy',
    icon: Zap,
    description: 'Perfect for beginners',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    timePerQuestion: 30
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: Target,
    description: 'Balanced challenge',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    timePerQuestion: 45
  },
  {
    value: 'hard',
    label: 'Hard',
    icon: Trophy,
    description: 'Test your mastery',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    timePerQuestion: 60
  }
];

const questionCountOptions = [5, 10, 15, 20, 25, 30, 40, 50];

export function QuizConfig({ quizData, onDataChange }: QuizConfigProps) {
  const [localDifficulty, setLocalDifficulty] = useState(quizData.difficulty);
  const [localQuestionCount, setLocalQuestionCount] = useState(quizData.questionCount);

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    setLocalDifficulty(difficulty);
    onDataChange({ ...quizData, difficulty });
  };

  const handleQuestionCountChange = (count: number) => {
    setLocalQuestionCount(count);
    onDataChange({ ...quizData, questionCount: count });
  };

  const selectedDifficulty = difficultyOptions.find(d => d.value === localDifficulty);
  const estimatedTime = Math.ceil((localQuestionCount * (selectedDifficulty?.timePerQuestion || 45)) / 60);

  return (
    <div className="quiz-config-container">
      <div className="quiz-config-content">
        <h2 className="config-title">Configure Your Quiz</h2>
        <p className="config-subtitle">Customize difficulty and number of questions</p>

        {/* Difficulty Selection */}
        <div className="config-section">
          <h3 className="section-title">Select Difficulty</h3>
          <div className="difficulty-grid">
            {difficultyOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = localDifficulty === option.value;

              return (
                <div
                  key={option.value}
                  className={`difficulty-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleDifficultyChange(option.value as 'easy' | 'medium' | 'hard')}
                  style={{
                    '--difficulty-color': option.color,
                    '--difficulty-bg': option.bgColor,
                  } as React.CSSProperties}
                >
                  <div className="difficulty-icon">
                    <Icon size={32} />
                  </div>
                  <h4 className="difficulty-label">{option.label}</h4>
                  <p className="difficulty-description">{option.description}</p>
                  <div className="difficulty-time">
                    <Clock size={14} />
                    <span>{option.timePerQuestion}s per question</span>
                  </div>
                  <div className="difficulty-selection-indicator"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Count Selection */}
        <div className="config-section">
          <h3 className="section-title">Number of Questions</h3>
          <div className="question-count-container">
            <div className="question-count-slider">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={localQuestionCount}
                onChange={(e) => handleQuestionCountChange(Number(e.target.value))}
                className="slider"
                style={{
                  '--slider-progress': `${((localQuestionCount - 5) / 45) * 100}%`,
                } as React.CSSProperties}
              />
              <div className="slider-labels">
                {questionCountOptions.map((count) => (
                  <span
                    key={count}
                    className={`slider-label ${localQuestionCount === count ? 'active' : ''}`}
                    onClick={() => handleQuestionCountChange(count)}
                  >
                    {count}
                  </span>
                ))}
              </div>
            </div>
            <div className="question-count-display">
              <div className="count-number">{localQuestionCount}</div>
              <div className="count-label">questions</div>
            </div>
          </div>
        </div>

        {/* Quiz Summary */}
        <div className="quiz-summary-card">
          <h3 className="summary-title">Quiz Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-icon">📚</span>
              <div>
                <p className="summary-label">Subject</p>
                <p className="summary-value capitalize">{quizData.subject}</p>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">📖</span>
              <div>
                <p className="summary-label">Chapters</p>
                <p className="summary-value">{quizData.chapters.length} selected</p>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon" style={{ color: selectedDifficulty?.color }}>
                {selectedDifficulty && <selectedDifficulty.icon size={20} />}
              </span>
              <div>
                <p className="summary-label">Difficulty</p>
                <p className="summary-value capitalize" style={{ color: selectedDifficulty?.color }}>
                  {localDifficulty}
                </p>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⏱️</span>
              <div>
                <p className="summary-label">Estimated Time</p>
                <p className="summary-value">{estimatedTime} minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}