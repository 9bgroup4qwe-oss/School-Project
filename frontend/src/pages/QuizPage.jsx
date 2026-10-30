import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NCERT_CURRICULUM } from '../services/ncertCurriculum';
import { soundEffects } from '../utils/audio';
import {
  Sparkles, Brain, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw,
  Clock, ShieldCheck, BookOpen, Layers, Check, AlertCircle, Timer,
  Volume2, VolumeX, Atom, Calculator, Globe2, Cpu, ChevronRight,
  Sliders, Award, Search, CheckSquare, Square
} from 'lucide-react';

export default function QuizPage() {
  // Main view state: 'config' | 'in_progress' | 'results'
  const [step, setStep] = useState('config');

  // Multi-step sequential menu state:
  // 1: Select Grade -> 2: Select Subject -> 3: Choose Chapters -> 4: Quiz Preferences
  const [configStep, setConfigStep] = useState(1);
  const [soundOn, setSoundOn] = useState(true);
  const [chapterSearch, setChapterSearch] = useState('');

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
  const [timeRemaining, setTimeRemaining] = useState(300);
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

  // Sync sound toggle with sound engine
  const handleToggleSound = () => {
    const nextState = soundEffects.toggleSound();
    setSoundOn(nextState);
    if (nextState) {
      soundEffects.playSelect();
    }
  };

  // Helper to get modern Lucide icon without any emojis
  const getSubjectIcon = (sub) => {
    const name = (sub?.name || sub?.id || '').toLowerCase();
    if (name.includes('math')) return <Calculator size={22} color="#38bdf8" />;
    if (name.includes('sci') || name.includes('phys') || name.includes('chem') || name.includes('bio')) return <Atom size={22} color="#818cf8" />;
    if (name.includes('social') || name.includes('sst') || name.includes('hist') || name.includes('geo') || name.includes('civic') || name.includes('pol')) return <Globe2 size={22} color="#34d399" />;
    if (name.includes('ai') || name.includes('it') || name.includes('comp') || name.includes('tech')) return <Cpu size={22} color="#f472b6" />;
    if (name.includes('eng') || name.includes('lang') || name.includes('lit')) return <BookOpen size={22} color="#fbbf24" />;
    return <Layers size={22} color="#a78bfa" />;
  };

  // Step 1: Select Grade & advance
  const handleSelectGrade = (grade) => {
    setSelectedGrade(grade);
    soundEffects.playSelect();
    setTimeout(() => {
      setConfigStep(2);
      soundEffects.playNextStep();
    }, 180);
  };

  // Step 2: Select Subject & advance
  const handleSelectSubject = (subId) => {
    setSelectedSubjectId(subId);
    soundEffects.playSelect();
    setTimeout(() => {
      setConfigStep(3);
      soundEffects.playNextStep();
    }, 180);
  };

  // Step 3: Toggle Chapter
  const toggleChapter = (chapterName) => {
    const isAdding = !selectedChapters.includes(chapterName);
    soundEffects.playToggle(isAdding);
    setSelectedChapters(prev => {
      if (prev.includes(chapterName)) {
        return prev.filter(c => c !== chapterName);
      } else {
        return [...prev, chapterName];
      }
    });
  };

  // Step Navigation helpers
  const goToStep = (targetStep) => {
    if (targetStep < configStep) {
      soundEffects.playBack();
    } else {
      soundEffects.playNextStep();
    }
    setConfigStep(targetStep);
  };

  // Countdown timer for active exam
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

  const handleStartQuiz = async (e) => {
    if (e) e.preventDefault();
    if (selectedChapters.length === 0) {
      setError('Please select at least one syllabus chapter to test.');
      return;
    }

    soundEffects.playStartQuiz();
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
    soundEffects.playSelect();
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
        time_taken: Math.round(elapsedSeconds / Math.max(1, questions.length))
      }));

      const res = await api.submitQuiz(sessionId, {
        answers: submissionAnswers,
        total_time_seconds: elapsedSeconds
      });

      soundEffects.playScoreTriumph();
      setResultsData(res);
      setStep('results');
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentIndex];

  // Filtered chapters for Step 3 search
  const filteredChapters = (currentSubjectObj?.chapters || []).filter(ch =>
    ch.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* ERROR ALERT */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px', padding: '1rem', color: '#f87171', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: CONFIGURATION WIZARD WITH SEQUENTIAL SUB-MENUS */}
      {step === 'config' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2.25rem' }}>
          {/* Header Bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap', gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
              }}>
                <Sparkles size={24} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Customizable Quiz
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  Choose your grade, subject, chapters, and test format to generate an authentic AI exam.
                </p>
              </div>
            </div>

            {/* Sound FX Toggle Pill */}
            <button
              type="button"
              onClick={handleToggleSound}
              style={{
                background: soundOn ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${soundOn ? '#818cf8' : 'var(--border-subtle)'}`,
                color: soundOn ? '#818cf8' : 'var(--text-subtle)',
                borderRadius: '20px', padding: '0.45rem 0.9rem', fontSize: '0.8rem',
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
              title={soundOn ? 'Sound Effects Enabled (Click to mute)' : 'Sound Effects Muted (Click to enable)'}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{soundOn ? 'Sound FX On' : 'Muted'}</span>
            </button>
          </div>

          {/* Sequential Step Stepper Indicator */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem',
            marginBottom: '2rem', background: 'rgba(0,0,0,0.25)', padding: '0.5rem',
            borderRadius: '12px', border: '1px solid var(--border-subtle)'
          }}>
            {[
              { num: 1, label: '1. Class', value: `Class ${selectedGrade}` },
              { num: 2, label: '2. Subject', value: currentSubjectObj?.name?.split(' ')[0] || 'Subject' },
              { num: 3, label: '3. Chapters', value: `${selectedChapters.length} Selected` },
              { num: 4, label: '4. Format', value: `${difficulty.toUpperCase()} • ${questionCount}Q` }
            ].map(st => {
              const isCurrent = configStep === st.num;
              const isPassed = configStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => goToStep(st.num)}
                  style={{
                    background: isCurrent ? 'var(--accent-primary)' : isPassed ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    border: isCurrent ? '1px solid #818cf8' : '1px solid transparent',
                    borderRadius: '8px', padding: '0.6rem 0.75rem', textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    boxShadow: isCurrent ? '0 0 15px rgba(99, 102, 241, 0.35)' : 'none'
                  }}
                >
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: isCurrent ? '#fff' : isPassed ? '#818cf8' : 'var(--text-subtle)'
                  }}>
                    {st.label}
                  </div>
                  <div style={{
                    fontSize: '0.82rem', fontWeight: 700, marginTop: '0.2rem',
                    color: isCurrent ? '#fff' : isPassed ? '#cbd5e1' : 'var(--text-muted)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {st.value}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* SUB-MENU 1: SELECT ACADEMIC CLASS / GRADE                                 */}
          {/* ========================================================================= */}
          {configStep === 1 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  Step 1: Choose Your Academic Class / Grade
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Select your class to automatically load aligned CBSE & NCERT curriculum chapters.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
                {[6, 7, 8, 9, 10, 11, 12].map(g => {
                  const isSelected = selectedGrade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleSelectGrade(g)}
                      style={{
                        padding: '1.35rem 1rem',
                        borderRadius: '14px',
                        background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '2px solid #818cf8' : '1px solid var(--border-subtle)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.35)' : 'none',
                        transform: isSelected ? 'scale(1.02)' : 'none'
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.95rem'
                      }}>
                        {g}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>Class {g}</div>
                      <div style={{ fontSize: '0.72rem', color: isSelected ? '#a5b4fc' : 'var(--text-subtle)' }}>
                        {g >= 11 ? 'Senior Secondary' : g >= 9 ? 'Secondary Board' : 'Middle School'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                >
                  <span>Continue to Subjects</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-MENU 2: SELECT NCERT SUBJECT (NO EMOJIS, CLEAN LUCIDE ICONS)         */}
          {/* ========================================================================= */}
          {configStep === 2 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    Step 2: Select NCERT Subject (Class {selectedGrade})
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Choose the subject for which you want to generate quiz questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>Change Class {selectedGrade}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {availableSubjects.map(sub => {
                  const isSubSelected = sub.id === selectedSubjectId;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectSubject(sub.id)}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '14px',
                        textAlign: 'left',
                        background: isSubSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSubSelected ? '2px solid #818cf8' : '1px solid var(--border-subtle)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        transition: 'all 0.15s ease',
                        boxShadow: isSubSelected ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none',
                        transform: isSubSelected ? 'scale(1.02)' : 'none'
                      }}
                    >
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '10px',
                        background: isSubSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${isSubSelected ? '#818cf8' : 'var(--border-subtle)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getSubjectIcon(sub)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                          {sub.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <span style={{
                            fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.08)',
                            padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#cbd5e1', fontWeight: 600
                          }}>
                            {sub.chapters.length} Chapters
                          </span>
                          {sub.stream && sub.stream !== 'General' && (
                            <span style={{
                              fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.15)',
                              padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#a5b4fc', fontWeight: 600
                            }}>
                              {sub.stream}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                >
                  <span>Select Chapters</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-MENU 3: CHOOSE CHAPTERS TO INCLUDE                                    */}
          {/* ========================================================================= */}
          {configStep === 3 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    Step 3: Select Syllabus Chapters
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Class {selectedGrade} • {currentSubjectObj?.name} ({selectedChapters.length} of {currentSubjectObj?.chapters.length} selected)
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const allChaps = currentSubjectObj.chapters;
                      if (selectedChapters.length === allChaps.length) {
                        soundEffects.playToggle(false);
                        setSelectedChapters([]);
                      } else {
                        soundEffects.playToggle(true);
                        setSelectedChapters([...allChaps]);
                      }
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)',
                      color: '#a5b4fc', borderRadius: '8px', padding: '0.35rem 0.85rem',
                      fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {selectedChapters.length === currentSubjectObj?.chapters.length ? 'Clear All' : 'Select All Chapters'}
                  </button>
                </div>
              </div>

              {/* Chapter Search Filter */}
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter chapters by title..."
                  value={chapterSearch}
                  onChange={e => setChapterSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.85rem', padding: '0.65rem 0.9rem 0.65rem 2.5rem' }}
                />
              </div>

              {/* Chapters Checklist */}
              <div style={{
                maxHeight: '340px', overflowY: 'auto', background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem',
                marginBottom: '2rem'
              }}>
                {filteredChapters.map((chap, idx) => {
                  const isChecked = selectedChapters.includes(chap);
                  return (
                    <div
                      key={chap}
                      onClick={() => toggleChapter(chap)}
                      style={{
                        padding: '0.75rem 0.95rem', borderRadius: '10px', cursor: 'pointer',
                        background: isChecked ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                        border: isChecked ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem',
                        color: isChecked ? '#fff' : 'var(--text-muted)',
                        transition: 'all 0.12s ease',
                        boxShadow: isChecked ? '0 0 12px rgba(99, 102, 241, 0.25)' : 'none'
                      }}
                    >
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '5px',
                        border: `1.5px solid ${isChecked ? '#818cf8' : 'var(--border-subtle)'}`,
                        background: isChecked ? 'var(--accent-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isChecked && <Check size={13} color="#fff" strokeWidth={3} />}
                      </div>
                      <span style={{ fontWeight: isChecked ? 700 : 500, lineHeight: 1.35 }}>{chap}</span>
                    </div>
                  );
                })}
                {filteredChapters.length === 0 && (
                  <div style={{ color: 'var(--text-subtle)', fontStyle: 'italic', padding: '1rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                    No chapters matched your search query.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Subjects</span>
                </button>
                <button
                  type="button"
                  disabled={selectedChapters.length === 0}
                  onClick={() => goToStep(4)}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
                    opacity: selectedChapters.length === 0 ? 0.5 : 1
                  }}
                >
                  <span>Continue to Quiz Options ({selectedChapters.length} Selected)</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-MENU 4: CONFIGURE QUIZ OPTIONS & START                                */}
          {/* ========================================================================= */}
          {configStep === 4 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  Step 4: Configure Quiz Format & Difficulty
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Review your blueprint and launch your personalized AI assessment.
                </p>
              </div>

              {/* Difficulty Selection Cards */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select Assessment Rigor / Difficulty
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  {[
                    { id: 'easy', title: 'Easy (Concept Basics)', desc: 'Core definitions, formulas, and fundamental recall', color: '#10b981' },
                    { id: 'medium', title: 'Medium (CBSE Standard)', desc: 'Standard board exam pattern with conceptual reasoning', color: '#6366f1' },
                    { id: 'hard', title: 'Hard (Advanced Drill)', desc: 'Multi-concept integration, numericals, and board challenges', color: '#ef4444' }
                  ].map(diff => {
                    const isDiffSelected = difficulty === diff.id;
                    return (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => {
                          setDifficulty(diff.id);
                          soundEffects.playSelect();
                        }}
                        style={{
                          padding: '1.15rem',
                          borderRadius: '12px',
                          textAlign: 'left',
                          background: isDiffSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: isDiffSelected ? `2px solid ${diff.color}` : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isDiffSelected ? `0 0 15px ${diff.color}40` : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: diff.color }}></span>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{diff.title}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {diff.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Count Selector Chips */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Number of Questions
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[3, 5, 10, 15].map(cnt => {
                    const isSelected = questionCount === cnt;
                    return (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => {
                          setQuestionCount(cnt);
                          soundEffects.playSelect();
                        }}
                        style={{
                          flex: 1, minWidth: '120px', padding: '0.85rem 1rem', borderRadius: '12px',
                          background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                          color: '#fff', cursor: 'pointer', textAlign: 'center',
                          boxShadow: isSelected ? '0 0 15px rgba(99, 102, 241, 0.35)' : 'none'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{cnt} Questions</div>
                        <div style={{ fontSize: '0.75rem', color: isSelected ? '#a5b4fc' : 'var(--text-subtle)', marginTop: '0.2rem' }}>
                          ~{Math.round(cnt * 1.5)} Mins
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Blueprint Summary Card */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '2rem'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Quiz Blueprint Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Scope:</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Class {selectedGrade} • {currentSubjectObj?.name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Chapters Selected:</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{selectedChapters.length} Chapters</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Rigor & Length:</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>{difficulty.toUpperCase()} • {questionCount} Questions</div>
                  </div>
                </div>
              </div>

              {/* Inline Error display in step 4 */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px', padding: '1rem', color: '#f87171', marginBottom: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem'
                }}>
                  <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>{error}</div>
                </div>
              )}

              {/* Navigation and Launch Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Chapters</span>
                </button>

                <button
                  type="button"
                  disabled={loading || selectedChapters.length === 0}
                  onClick={handleStartQuiz}
                  className="btn-primary"
                  style={{
                    padding: '0.9rem 2.25rem', fontSize: '1.05rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)'
                  }}
                >
                  {loading ? (
                    <span>Generating with OpenAI...</span>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Start AI Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN AI SYNTHESIS LOADING OVERLAY */}
      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel animate-scale-up" style={{
            padding: '2.5rem 3rem', maxWidth: '460px', width: '90%', textAlign: 'center',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.3)'
          }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)'
            }}>
              <Brain size={36} color="#fff" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
              Synthesizing AI Quiz
            </h3>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              OpenAI is generating brand-new, concept-testing questions tailored to your syllabus.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '0.85rem', color: '#a5b4fc', fontWeight: 600
            }}>
              <Sparkles size={15} /> Class {selectedGrade} • {currentSubjectObj?.name} • {difficulty.toUpperCase()}
            </div>
          </div>
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
              onClick={() => {
                soundEffects.playBack();
                setCurrentIndex(prev => Math.max(0, prev - 1));
              }}
              disabled={currentIndex === 0}
              className="btn-secondary"
              style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => {
                  soundEffects.playNextStep();
                  setCurrentIndex(prev => prev + 1);
                }}
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
              onClick={() => {
                soundEffects.playNextStep();
                setStep('config');
                setConfigStep(1);
                setResultsData(null);
              }}
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
