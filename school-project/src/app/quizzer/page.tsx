'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen, List, Settings, Play } from 'lucide-react';
import { QuizProgress } from './components/QuizProgress';
import { SubjectGrid } from './components/SubjectGrid';
import { ChapterList } from './components/ChapterList';
import { QuizConfig } from './components/QuizConfig';
import { AuthGuard } from '@/components/auth/AuthGuard';
import './quizzer.css';

interface QuizData {
  subject: string;
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

const subjects = [
  { id: 'math', name: 'Mathematics', icon: '∑', description: 'Algebra, Calculus, Geometry' },
  { id: 'physics', name: 'Physics', icon: '⚛', description: 'Mechanics, Thermodynamics, Quantum' },
  { id: 'chemistry', name: 'Chemistry', icon: '⚗', description: 'Organic, Inorganic, Physical' },
  { id: 'biology', name: 'Biology', icon: '🧬', description: 'Cell, Genetics, Ecology' },
  { id: 'computer-science', name: 'Computer Science', icon: '💻', description: 'Algorithms, Data Structures, AI' },
  { id: 'history', name: 'History', icon: '📚', description: 'World, Ancient, Modern' },
  { id: 'geography', name: 'Geography', icon: '🌍', description: 'Physical, Human, Regional' },
  { id: 'literature', name: 'Literature', icon: '📖', description: 'Classic, Contemporary, Poetry' }
];

const chaptersData: Record<string, string[]> = {
  'math': ['Algebra Basics', 'Linear Equations', 'Quadratic Equations', 'Calculus I', 'Calculus II', 'Geometry', 'Trigonometry', 'Statistics'],
  'physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics', 'Quantum Mechanics', 'Relativity'],
  'chemistry': ['Atomic Structure', 'Periodic Table', 'Chemical Bonding', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry'],
  'biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Anatomy', 'Physiology', 'Microbiology', 'Botany'],
  'computer-science': ['Introduction to Programming', 'Data Structures', 'Algorithms', 'Database Systems', 'Web Development', 'Machine Learning', 'Operating Systems'],
  'history': ['Ancient Civilizations', 'Medieval History', 'Renaissance', 'Industrial Revolution', 'World Wars', 'Cold War', 'Modern History'],
  'geography': ['Physical Geography', 'Climate', 'Landforms', 'Human Geography', 'Economic Geography', 'Regional Studies'],
  'literature': ['Classical Literature', 'Shakespeare', 'Romanticism', 'Modern Literature', 'Contemporary Fiction', 'Poetry', 'Drama']
};

export default function QuizzerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [quizData, setQuizData] = useState<QuizData>({
    subject: '',
    chapters: [],
    difficulty: 'medium',
    questionCount: 10
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const steps = [
    { id: 'subject', title: 'Subject', icon: BookOpen },
    { id: 'chapters', title: 'Chapters', icon: List },
    { id: 'config', title: 'Configure', icon: Settings }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep || (stepIndex === currentStep + 1 && quizData.subject)) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return quizData.subject !== '';
      case 1:
        return quizData.chapters.length > 0;
      case 2:
        return quizData.difficulty && quizData.questionCount > 0;
      default:
        return false;
    }
  };

  const startQuiz = () => {
    // Prepare quiz data for URL
    const subjectName = subjects.find(s => s.id === quizData.subject)?.name || quizData.subject;
    const selectedChapterNames = quizData.chapters.map(chapterId => {
      const chapterIndex = chaptersData[quizData.subject]?.indexOf(chapterId);
      return chapterIndex !== undefined ? chaptersData[quizData.subject][chapterIndex] : chapterId;
    });

    const quizConfig = {
      subject: subjectName,
      chapters: selectedChapterNames,
      difficulty: quizData.difficulty,
      questionCount: quizData.questionCount
    };

    // Navigate to quiz page with data
    const quizDataString = encodeURIComponent(JSON.stringify(quizConfig));
    router.push(`/quiz?quizData=${quizDataString}`);
  };

  return (
    <AuthGuard>
      <div className="quizzer-container">
        <div className="quizzer-background">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
        </div>

        <div className="quizzer-content">
        {/* Header */}
        <header className="quizzer-header">
          <h1 className="quizzer-title">Quiz Setup</h1>
          <p className="quizzer-subtitle">Configure your personalized quiz experience</p>
        </header>

        {/* Progress Navigation */}
        <QuizProgress
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* Main Content */}
        <div className="quiz-step-container">
          <div className={`quiz-step-content ${isTransitioning ? 'transitioning' : ''}`}>
            {currentStep === 0 && (
              <SubjectGrid
                subjects={subjects}
                selectedSubject={quizData.subject}
                onSubjectSelect={(subject) => setQuizData({ ...quizData, subject })}
              />
            )}

            {currentStep === 1 && (
              <ChapterList
                subject={subjects.find(s => s.id === quizData.subject)}
                chapters={chaptersData[quizData.subject] || []}
                selectedChapters={quizData.chapters}
                onChaptersChange={(chapters) => setQuizData({ ...quizData, chapters })}
              />
            )}

            {currentStep === 2 && (
              <QuizConfig
                quizData={quizData}
                onDataChange={(data) => setQuizData(data)}
              />
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="quiz-navigation">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="nav-button nav-button-secondary"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={startQuiz}
              disabled={!canProceed()}
              className="nav-button nav-button-primary"
            >
              <Play size={20} />
              Start Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="nav-button nav-button-primary"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Summary Card */}
        {currentStep > 0 && (
          <div className="quiz-summary">
            <h3>Quiz Summary</h3>
            <div className="summary-item">
              <span className="summary-label">Subject:</span>
              <span className="summary-value">
                {subjects.find(s => s.id === quizData.subject)?.name}
              </span>
            </div>
            {quizData.chapters.length > 0 && (
              <div className="summary-item">
                <span className="summary-label">Chapters:</span>
                <span className="summary-value">{quizData.chapters.length} selected</span>
              </div>
            )}
            {quizData.difficulty && (
              <div className="summary-item">
                <span className="summary-label">Difficulty:</span>
                <span className="summary-value capitalize">{quizData.difficulty}</span>
              </div>
            )}
            {quizData.questionCount > 0 && (
              <div className="summary-item">
                <span className="summary-label">Questions:</span>
                <span className="summary-value">{quizData.questionCount}</span>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </AuthGuard>
  );
}