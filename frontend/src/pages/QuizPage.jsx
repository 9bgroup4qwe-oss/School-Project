import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NCERT_CURRICULUM } from '../services/ncertCurriculum';
import {
  Sparkles, Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Clock, ShieldCheck, BookOpen, Layers, Check, AlertCircle, Timer
} from 'lucide-react';

export default function QuizPage() {
  // Step 1: Config; Step 2: In-Progress; Step 3: Results
  const [step, setStep] = useState('config');

  // Grade & NCERT State
  const [selectedGrade, setSelectedGrade] = useState(10);
  const [selectedSubjectId, setSelectedSubjectId] = useState('science');
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active Quiz State
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [source, setSource] = useState('ai');
  const [timeRemaining, setTimeRemaining] = useState(300); // Dynamic timer in seconds
  const [quizTimerActive, setQuizTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Results State
  const [resultsData, setResultsData] = useState(null);

  // Available subjects for the chosen grade
  const currentGradeData = NCERT_CURRICULUM[selectedGrade] || NCERT_CURRICULUM[10];
  const availableSubjects = currentGradeData.subjects || [];
  const currentSubjectObj = availableSubjects.find(s => s.id === selectedSubjectId) || availableSubjects[0];

  // Whenever grade changes, default to its first subject and reset chapters
  useEffect(() => {
    if (availableSubjects.length > 0) {
      setSelectedSubjectId(availableSubjects[0].id);
      setSelectedChapters(availableSubjects[0].chapters.slice(0, 2));
    }
  }, [selectedGrade]);

  // Whenever subject changes, select its first 2 chapters
  useEffect(() => {
    if (currentSubjectObj) {
      setSelectedChapters(currentSubjectObj.chapters.slice(0, 2));
    }
  }, [selectedSubjectId]);

  // Quiz Countdown Timer
  useEffect(() => {
    let timer;
    if (quizTimerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizTimerActive, timeRemaining]);

  const toggleChapter = (chapterName) => {
    setSelectedChapters(prev => {
      if (prev.includes(chapterName)) {
        return prev.filter(c => c !== chapterName);
      } else {
        return [...prev, chapterName];
      }
    });
  };

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    if (selectedChapters.length === 0) {
      setError('Please select at least one NCERT chapter to test.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.generateQuiz({
        grade: Number(selectedGrade),
        subject: currentSubjectObj.name,
        chapters: selectedChapters,
        difficulty,
        question_count: Number(questionCount)
      });

      setSessionId(res.session_id);
      setQuestions(res.questions);
      setSource(res.source);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setStartTime(Date.now());
      setTimeRemaining(res.time_limit_seconds || questionCount * 90);
      setQuizTimerActive(true);
      setStep('in_progress');
    } catch (err) {
      setError(err.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    setQuizTimerActive(false);
    setLoading(true);
    setError('');

    try {
      const elapsedSeconds = Math.round((Date.now() - (startTime || Date.now())) / 1000);
      const submissionAnswers = questions.map(q => ({
        question_id: q.id,
        selected_option: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : 0,
        time_taken: Math.round(elapsedSeconds / questions.length)
      }));

      const res = await api.submitQuiz(sessionId, {
        answers: submissionAnswers,
        time_taken: elapsedSeconds
      });

      setResultsData(res);
      setStep('results');
    } catch (err) {
      setError(err.message || 'Submission error');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const currentQ = questions[currentIndex];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Fallback indicator */}
      {source === 'curriculum-fallback' && step !== 'config' && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px', padding: '0.75rem 1.25rem', color: '#fbbf24', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'
        }}>
          <ShieldCheck size={18} />
          <span>Offline Curriculum Backup: Questions dynamically mapped from verified NCERT question pool.</span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px', padding: '0.75rem 1.25rem', color: '#f87171', fontSize: '0.85rem',
          marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: CONFIGURATION WITH GRADE & NCERT SYLLABUS PICKER */}
      {step === 'config' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--accent-glow)'
            }}>
              <Brain size={28} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>NCERT Adaptive Exam Arena</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Select your Class, pick syllabus chapters, and let AI test your core concept mastery.
              </p>
            </div>
          </div>

          <form onSubmit={handleStartQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Grade Selection Chips */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. Select Academic Class / Grade
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[6, 7, 8, 9, 10, 11, 12].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGrade(g)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '10px',
                      background: selectedGrade === g ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                      border: selectedGrade === g ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                      color: selectedGrade === g ? '#fff' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: selectedGrade === g ? '0 0 15px rgba(99, 102, 241, 0.35)' : 'none'
                    }}
                  >
                    Class {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Select NCERT Subject
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {availableSubjects.map(sub => {
                  const isSubSelected = sub.id === selectedSubjectId;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(sub.id)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        textAlign: 'left',
                        background: isSubSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSubSelected ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                        color: isSubSelected ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{sub.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{sub.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          {sub.chapters.length} Chapters
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chapters Multiselect */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3. Choose Chapters to Include ({selectedChapters.length} selected)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedChapters.length === currentSubjectObj.chapters.length) {
                      setSelectedChapters([]);
                    } else {
                      setSelectedChapters([...currentSubjectObj.chapters]);
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {selectedChapters.length === currentSubjectObj.chapters.length ? 'Clear all' : 'Select all'}
                </button>
              </div>

              <div style={{
                maxHeight: '220px', overflowY: 'auto', background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.75rem',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem'
              }}>
                {currentSubjectObj.chapters.map(chap => {
                  const isChecked = selectedChapters.includes(chap);
                  return (
                    <div
                      key={chap}
                      onClick={() => toggleChapter(chap)}
                      style={{
                        padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
                        background: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: isChecked ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
                        color: isChecked ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '4px',
                        border: `1px solid ${isChecked ? '#818cf8' : 'var(--border-subtle)'}`,
                        background: isChecked ? 'var(--accent-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isChecked && <Check size={12} color="#fff" />}
                      </div>
                      <span style={{ fontWeight: isChecked ? 600 : 400 }}>{chap}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty & Count */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Difficulty Level
                </label>
                <select
                  className="input-field"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy (Concept Basics)</option>
                  <option value="medium">Medium (Standard CBSE Exam)</option>
                  <option value="hard">Hard (Advanced Board Problem)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Question Count: <span style={{ color: '#818cf8' }}>{questionCount} Questions (~{questionCount * 1.5} mins)</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={questionCount}
                  onChange={e => setQuestionCount(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '0.5rem', cursor: 'pointer' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? (
                <span>Assembling Class {selectedGrade} Exam...</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Launch Practice Quiz</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: ACTIVE EXAM WITH LIVE PROPER TIMING */}
      {step === 'in_progress' && currentQ && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
          {/* Header Bar with Live Countdown Timer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className={`badge badge-${currentQ.difficulty}`}>
                {currentQ.difficulty}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 700 }}>
                Class {selectedGrade} • {currentQ.chapter}
              </span>
            </div>

            {/* Countdown Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.9rem', borderRadius: '8px',
              background: timeRemaining < 60 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)',
              border: `1px solid ${timeRemaining < 60 ? '#ef4444' : '#818cf8'}`,
              color: timeRemaining < 60 ? '#f87171' : '#818cf8', fontWeight: 700, fontSize: '0.9rem'
            }}>
              <Timer size={16} />
              <span>{formatTimer(timeRemaining)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            Question {currentIndex + 1} of {questions.length}
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.45, marginBottom: '2.25rem' }}>
            {currentQ.question_text}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === oIdx;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(currentQ.id, oIdx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.1rem 1.35rem', borderRadius: '12px', textAlign: 'left',
                    background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                    color: '#fff', cursor: 'pointer', transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 18px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.95rem'
                  }}>
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn-secondary"
              style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="btn-primary"
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={loading}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                {loading ? 'Submitting & Grading...' : 'Finish & Submit'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: RESULTS WITH STEP-BY-STEP EXPLANATIONS */}
      {step === 'results' && resultsData && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '90px', height: '90px', borderRadius: '50%',
              background: resultsData.score_percentage >= 60 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `2px solid ${resultsData.score_percentage >= 60 ? '#10b981' : '#ef4444'}`,
              fontSize: '2rem', fontWeight: 800, marginBottom: '1rem'
            }}>
              {isNaN(resultsData.score_percentage) ? '0%' : `${resultsData.score_percentage}%`}
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Performance Assessment</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Completed in {resultsData.time_taken}s • <span style={{ color: '#fff', fontWeight: 700 }}>{resultsData.correct_answers}</span> of {resultsData.total_questions} correct
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {resultsData.results.map((res, rIdx) => (
              <div
                key={res.question_id || rIdx}
                style={{
                  padding: '1.5rem',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${res.is_correct ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                  {res.is_correct ? (
                    <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <XCircle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: res.is_correct ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: res.is_correct ? '#34d399' : '#f87171',
                        border: `1px solid ${res.is_correct ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                      }}>
                        {res.is_correct ? 'Correct' : 'Needs Review'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.75rem' }}>
                      {res.question_text}
                    </h4>

                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem',
                      background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem', borderRadius: '10px',
                      border: '1px solid var(--border-subtle)', marginBottom: '0.85rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                          Your Selection
                        </div>
                        <div style={{ color: res.is_correct ? '#34d399' : '#f87171', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                          {res.options[res.selected_option] || 'No option chosen'}
                        </div>
                      </div>

                      {!res.is_correct && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>
                            Verified Correct Answer
                          </div>
                          <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                            {res.options[res.correct_answer]}
                          </div>
                        </div>
                      )}
                    </div>

                    {res.explanation && (
                      <div style={{
                        fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5,
                        background: res.is_correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.1)',
                        padding: '0.85rem 1.15rem', borderRadius: '10px',
                        borderLeft: `4px solid ${res.is_correct ? '#10b981' : '#818cf8'}`,
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>💡</span>
                          <span>Conceptual Rationale & NCERT Guide:</span>
                        </div>
                        <div style={{ color: '#cbd5e1' }}>{res.explanation}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => { setStep('config'); setResultsData(null); }}
              className="btn-primary"
            >
              <RotateCcw size={18} />
              <span>Configure Another Exam</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
