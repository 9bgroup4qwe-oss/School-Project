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
  { id: 'math', name: 'Mathematics', icon: '∑', description: 'Algebra, Calculus, Geometry, Statistics' },
  { id: 'physics', name: 'Physics', icon: '⚛', description: 'Mechanics, Thermodynamics, Optics, Modern' },
  { id: 'chemistry', name: 'Chemistry', icon: '⚗', description: 'Organic, Inorganic, Physical' },
  { id: 'biology', name: 'Biology', icon: '🧬', description: 'Cell, Genetics, Ecology, Physiology' },
  { id: 'accountancy', name: 'Accountancy', icon: '📊', description: 'Partnership, Shares, Cash Flow, Financial Analysis' },
  { id: 'business', name: 'Business Studies', icon: '💼', description: 'Principles of Management, Marketing, Planning, Finance' },
  { id: 'economics', name: 'Economics', icon: '📈', description: 'Macroeconomics, Microeconomics, Indian Economy' },
  { id: 'political-science', name: 'Political Science', icon: '🏛', description: 'Indian Constitution, Contemporary World Politics' },
  { id: 'history', name: 'History', icon: '📚', description: 'Ancient Civilizations, Indian History, World Wars' },
  { id: 'geography', name: 'Geography', icon: '🌍', description: 'Physical Geography, Human Resources, Climate' },
  { id: 'computer-science', name: 'Computer Science', icon: '💻', description: 'Python Programming, Data Structures, SQL' },
  { id: 'literature', name: 'English Literature', icon: '📖', description: 'NCERT Prose, Poetry, Grammar & Reading' }
];

const chaptersData: Record<string, string[]> = {
  'math': ['Real Numbers', 'Polynomials', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Trigonometry', 'Calculus', 'Probability & Statistics'],
  'physics': ['Electric Charges & Fields', 'Electrostatic Potential', 'Current Electricity', 'Moving Charges & Magnetism', 'Ray Optics', 'Wave Optics', 'Dual Nature of Radiation', 'Semiconductors'],
  'chemistry': ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'd and f Block Elements', 'Coordination Compounds', 'Haloalkanes', 'Alcohols & Phenols', 'Aldehydes & Ketones', 'Biomolecules'],
  'biology': ['Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Principles of Inheritance', 'Molecular Basis of Inheritance', 'Human Health and Disease', 'Biotechnology', 'Ecology'],
  'accountancy': ['Accounting for Partnership: Basic Concepts', 'Reconstitution: Admission of a Partner', 'Reconstitution: Retirement/Death', 'Dissolution of Partnership Firm', 'Accounting for Share Capital', 'Issue and Redemption of Debentures', 'Financial Statements of a Company', 'Accounting Ratios', 'Cash Flow Statement'],
  'business': ['Nature and Significance of Management', 'Principles of Management (Taylor & Fayol)', 'Business Environment', 'Planning', 'Organising', 'Staffing', 'Directing', 'Controlling', 'Financial Management', 'Financial Markets', 'Marketing Management', 'Consumer Protection'],
  'economics': ['National Income and Related Aggregates', 'Money and Banking', 'Determination of Income and Employment', 'Government Budget and the Economy', 'Balance of Payments', 'Development Experience (1947-90)', 'Economic Reforms Since 1991 (LPG)', 'Current Challenges in Indian Economy'],
  'political-science': ['The End of Bipolarity', 'Contemporary Centres of Power', 'Contemporary South Asia', 'International Organisations', 'Security in Contemporary World', 'Challenges of Nation-Building', 'Era of One-Party Dominance', 'Politics of Planned Development', 'Democratic Resurgence'],
  'history': ['Bricks, Beads and Bones (Harappan)', 'Kings, Farmers and Towns', 'Kinship, Caste and Class', 'Thinkers, Beliefs and Buildings', 'An Imperial Capital: Vijayanagara', 'Peasants, Zamindars and State', 'Rebels and the Raj (1857)', 'Mahatma Gandhi and the Nationalist Movement', 'Framing the Constitution'],
  'geography': ['Human Geography: Nature and Scope', 'The World Population Distribution', 'Human Development', 'Primary Activities', 'Secondary Activities', 'Tertiary and Quaternary Activities', 'Transport and Communication', 'International Trade'],
  'computer-science': ['Review of Python Basics', 'Functions and Modules', 'File Handling in Python', 'Data Structures (Stack and Queue)', 'Computer Networks', 'Database Management and SQL', 'Societal Impacts and Cyber Safety'],
  'literature': ['The Last Lesson', 'Lost Spring', 'Deep Water', 'The Rattrap', 'Indigo', 'My Mother at Sixty-Six', 'Keeping Quiet', 'A Thing of Beauty', 'A Roadside Stand', 'The Third Level', 'The Tiger King']
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