'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';
import { QuizQuestion } from '../quizzer/lib/quizAIService';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { quizSessionService } from '@/services/quizSessionService';
import './quiz.css';

interface QuizAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<any>(null);

  // Parse quiz data from URL search params with error handling
  useEffect(() => {
    const quizDataParam = searchParams.get('quizData');
    console.log('Quiz data from search params:', quizDataParam);

    // Check if quizData parameter exists
    if (!quizDataParam) {
      console.log('No quizData parameter found in URL');
      setError('No quiz configuration found. Please start a new quiz from the quiz setup page.');
      setIsLoading(false);
      return;
    }

    console.log('Raw quizData:', quizDataParam);

    // Parse the quiz data
    try {
      const parsedData = JSON.parse(decodeURIComponent(quizDataParam));
      console.log('Parsed quiz data:', parsedData);

      // Validate the parsed data
      if (!parsedData.subject || !parsedData.chapters || !parsedData.difficulty || !parsedData.questionCount) {
        throw new Error('Invalid quiz configuration');
      }

      setQuizData(parsedData);
    } catch (err) {
      console.error('Quiz data parsing error:', err);
      setError('Invalid quiz configuration. Please start a new quiz from the quiz setup page.');
      setIsLoading(false);
    }
  }, [searchParams]);

  // Generate quiz using API
  const generateQuiz = async () => {
    if (!quizData) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create quiz session first
      await quizSessionService.createSession({
        subject: quizData.subject,
        chapters: quizData.chapters,
        difficulty: quizData.difficulty,
        questionCount: quizData.questionCount
      });

      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const questionsWithIds = data.questions.map((q: any, idx: number) => ({
        ...q,
        id: q.id || `q_${Date.now()}_${idx}`
      }));

      setQuestions(questionsWithIds);

      // Save questions to database
      await quizSessionService.saveQuestions(questionsWithIds);

      // Start timer for first question
      quizSessionService.startQuestionTimer();

      setIsLoading(false);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz questions');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Generate questions when quizData is available
    if (quizData && !error) {
      generateQuiz();
    }
  }, [quizData, error]);

  const handleAnswerSelect = async (optionIndex: number) => {
    if (isSubmitted) return;

    const question = questions[currentQuestion];
    const isCorrect = optionIndex === question.correctAnswer;

    // Update local state
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === question.id);
      if (existing !== -1) {
        const newAnswers = [...prev];
        newAnswers[existing] = {
          questionId: question.id,
          selectedOption: optionIndex,
          isCorrect
        };
        return newAnswers;
      }
      return [...prev, {
        questionId: question.id,
        selectedOption: optionIndex,
        isCorrect
      }];
    });

    // Save to database
    try {
      await quizSessionService.saveAnswer(question.dbId || question.id, optionIndex, isCorrect);
    } catch (error) {
      console.error('Error saving answer:', error);
      // Continue with quiz even if save fails
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsSubmitted(false);
      // Start timer for next question
      quizSessionService.startQuestionTimer();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setIsSubmitted(false);
      // Start timer for previous question
      quizSessionService.startQuestionTimer();
    }
  };

  const handleSubmitQuiz = async () => {
    setShowResult(true);

    // Complete the quiz session
    try {
      await quizSessionService.completeSession();
    } catch (error) {
      console.error('Error completing quiz session:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    return answers.filter(a => a.isCorrect).length;
  };

  const calculatePercentage = () => {
    return Math.round((calculateScore() / questions.length) * 100);
  };

  const getScoreMessage = () => {
    const percentage = calculatePercentage();
    if (percentage >= 90) return "Outstanding! You're a master! 🏆";
    if (percentage >= 80) return "Excellent work! Keep it up! 🌟";
    if (percentage >= 70) return "Good job! Room for improvement! 👍";
    if (percentage >= 60) return "Not bad! Keep practicing! 📚";
    return "Keep learning! You'll do better next time! 💪";
  };

  const handleRetry = () => {
    if (quizData) {
      generateQuiz();
    } else {
      router.push('/quizzer');
    }
  };

  // Cleanup abandoned session on unmount
  useEffect(() => {
    return () => {
      if (quizSessionService.getCurrentSession()) {
        quizSessionService.abandonSession();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="quiz-container">
          <div className="quiz-loading">
            <div className="loading-spinner"></div>
            <h2>Generating Quiz Questions...</h2>
            <p>Please wait while AI creates your personalized quiz</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="quiz-container">
          <div className="quiz-error">
            <XCircle size={64} color="#ef4444" />
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleRetry} className="retry-button">
                <RotateCcw size={20} />
                Try Again
              </button>
              <button onClick={() => router.push('/quizzer')} className="retry-button secondary">
                Back to Quiz Setup
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (showResult) {
    return (
      <AuthGuard>
        <div className="quiz-container">
        <div className="quiz-results">
          <div className="results-header">
            <Award size={80} color="#ffe537" />
            <h1>Quiz Complete!</h1>
            <p className="score-message">{getScoreMessage()}</p>
          </div>

          <div className="score-display">
            <div className="score-circle">
              <span className="score-percentage">{calculatePercentage()}%</span>
            </div>
            <div className="score-details">
              <p>You got <strong>{calculateScore()}</strong> out of <strong>{questions.length}</strong> questions correct</p>
              <p>Time taken: {formatTime(1800 - timeLeft)}</p>
            </div>
          </div>

          <div className="results-summary">
            <h3>Performance Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-label">Correct</span>
                <span className="stat-value correct">{calculateScore()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Incorrect</span>
                <span className="stat-value incorrect">{questions.length - calculateScore()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{calculatePercentage()}%</span>
              </div>
            </div>
          </div>

          {/* Mistakes Review */}
          {questions.some((q, idx) => {
            const answer = answers.find(a => a.questionId === q.id);
            return answer && !answer.isCorrect;
          }) && (
            <div className="mistakes-review">
              <h3>Review Your Mistakes</h3>
              <div className="mistakes-list">
                {questions.map((question, idx) => {
                  const answer = answers.find(a => a.questionId === question.id);
                  if (!answer || answer.isCorrect) return null;

                  return (
                    <div key={question.id} className="mistake-item">
                      <div className="mistake-header">
                        <span className="mistake-number">Question {idx + 1}</span>
                        <span className="mistake-chapter">{question.chapter}</span>
                      </div>
                      <p className="mistake-question">{question.question}</p>
                      <div className="mistake-answer">
                        <span className="your-answer incorrect">
                          Your answer: {String.fromCharCode(65 + answer.selectedOption)}
                        </span>
                        <span className="correct-answer">
                          Correct answer: {String.fromCharCode(65 + question.correctAnswer)}
                        </span>
                      </div>
                      <div className="mistake-explanation">
                        <strong>Explanation:</strong> {question.explanation || 'No explanation available.'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="results-actions">
            <button onClick={handleRetry} className="action-button secondary">
              Back to Quiz Setup
            </button>
            <button onClick={() => window.print()} className="action-button primary">
              Print Results
            </button>
          </div>
        </div>
      </div>
      </AuthGuard>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = question ? answers.find(a => a.questionId === question.id) : null;

  return (
    <AuthGuard>
      <div className="quiz-container">
      <div className="quiz-background">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
      </div>

      <div className="quiz-content">
        {/* Header */}
        <header className="quiz-header">
          <div className="quiz-info">
            <h1>{quizData.subject} Quiz</h1>
            <div className="quiz-meta">
              <span className="difficulty-badge">{quizData.difficulty}</span>
              <span className="question-counter">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
          </div>
          <div className="quiz-timer">
            <Clock size={20} />
            <span className={timeLeft < 300 ? 'warning' : ''}>{formatTime(timeLeft)}</span>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="quiz-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="question-container">
          <div className="question-header">
            <span className="chapter-tag">{question.chapter}</span>
          </div>
          <h2 className="question-text">{question.question}</h2>
        </div>

        {/* Options */}
        <div className="options-container">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer?.selectedOption === index;
            const isCorrect = index === question.correctAnswer;
            const showCorrect = isSubmitted && isCorrect;
            const showIncorrect = isSubmitted && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`option-button ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showIncorrect ? 'incorrect' : ''}`}
                disabled={isSubmitted}
              >
                <div className="option-content">
                  <span className="option-label">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </div>
                {showCorrect && <CheckCircle className="option-icon correct" size={24} />}
                {showIncorrect && <XCircle className="option-icon incorrect" size={24} />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isSubmitted && selectedAnswer && (
          <div className="explanation-container">
            <h3>Explanation:</h3>
            <p>{question.explanation || 'No explanation provided for this question.'}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="quiz-navigation">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="nav-button secondary"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {!isSubmitted ? (
            <button
              onClick={() => setIsSubmitted(true)}
              disabled={!selectedAnswer}
              className="nav-button primary"
            >
              Submit Answer
            </button>
          ) : currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="nav-button primary"
            >
              Finish Quiz
              <Award size={20} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="nav-button primary"
            >
              Next Question
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="quiz-container"><div className="loading-spinner">Loading quiz...</div></div>}>
      <QuizContent />
    </Suspense>
  );
}