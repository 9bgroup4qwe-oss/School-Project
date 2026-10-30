import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { soundEffects } from '../utils/audio';
import {
  Calendar, Plus, Sparkles, FileText, Upload, Clock, Check,
  MessageSquare, Send, Bot, User, X, ChevronRight, AlertTriangle,
  ShieldCheck, CheckCircle2, RotateCcw, Target, CalendarDays, Award, Image
} from 'lucide-react';

export default function TimetablePage() {
  const [timetables, setTimetables] = useState([]);
  const [activeTimetable, setActiveTimetable] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-detected weak areas from quiz performance
  const [detectedWeakAreas, setDetectedWeakAreas] = useState([]);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChatBot, setShowChatBot] = useState(true);

  // Exam Date & Generation State
  const [selectedGrade, setSelectedGrade] = useState(10);
  const [subjects, setSubjects] = useState('Science');
  const [examDate, setExamDate] = useState('2026-11-15');
  const [weakAreas, setWeakAreas] = useState('');
  const [syllabusTopics, setSyllabusTopics] = useState([]);
  const [hours, setHours] = useState(3);
  const [schoolEndTime, setSchoolEndTime] = useState('15:30');
  const [generating, setGenerating] = useState(false);
  const [reallocating, setReallocating] = useState(false);

  // Syllabus Upload State (.md, picture, .pdf)
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Chat Bot State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey! I am your Grow My IQ AI Timetable Director. I automatically adjust your study dates for your upcoming exams (e.g. Nov 15). Check off completed topics or ask me to reschedule anything!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChatBot]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // 1. Fetch real weak areas calculated from student's quizzes
      const summary = await api.getDashboardSummary().catch(() => null);
      if (summary && summary.weak_areas && summary.weak_areas.length > 0) {
        const weakList = summary.weak_areas.map(w => `${w.subject}: ${w.chapter} (${w.accuracy_rate}% accuracy)`);
        setDetectedWeakAreas(weakList);
        setWeakAreas(summary.weak_areas.map(w => w.chapter).join(', '));
      }

      // 2. Fetch AI Timetable
      const list = await api.listTimetables();
      setTimetables(list);
      if (list.length > 0) {
        setActiveTimetable(list[0]);
        if (list[0].exam_date) {
          setExamDate(list[0].exam_date);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    soundEffects.playStartQuiz();
    setGenerating(true);
    try {
      const subList = subjects.split(',').map(s => s.trim()).filter(Boolean);
      const weakList = weakAreas.split(',').map(s => s.trim()).filter(Boolean);

      const created = await api.generateTimetable({
        grade: Number(selectedGrade),
        subjects: subList,
        weak_areas: weakList,
        syllabus_topics: syllabusTopics,
        exam_date: examDate,
        available_hours_per_day: Number(hours),
        school_end_time: schoolEndTime
      });

      setTimetables(prev => [created, ...prev]);
      setActiveTimetable(created);
      setShowGenerateModal(false);
      soundEffects.playNotification();

      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Done! Assembled your AI Study Roadmap with specific calendar dates leading directly to your exam on ${examDate}. Your ${weakList.length} weak areas have been assigned priority slots!`
        }
      ]);
    } catch (err) {
      alert(err.message || 'Failed to generate timetable');
    } finally {
      setGenerating(false);
    }
  };

  const handleSyllabusUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    soundEffects.playSelect();
    setUploading(true);
    setUploadSuccessMsg('');

    try {
      const res = await api.extractSyllabus(uploadFile);
      if (res.topics && res.topics.length > 0) {
        setSyllabusTopics(res.topics);
        setWeakAreas(res.topics.slice(0, 4).join(', '));
      }
      if (res.detected_exam_date) {
        setExamDate(res.detected_exam_date);
      }
      if (res.subject) {
        setSubjects(res.subject);
      }

      soundEffects.playNotification();
      setUploadSuccessMsg(
        `Extracted ${res.topics.length} topics from ${res.filename} (${res.file_type})! ${
          res.detected_exam_date ? `Detected Exam Date: ${res.detected_exam_date}` : ''
        }`
      );

      setTimeout(() => {
        setShowUploadModal(false);
        setShowGenerateModal(true);
      }, 1200);

    } catch (err) {
      alert(err.message || 'Syllabus upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleTopic = async (timetableId, slotId, currentCompleted) => {
    try {
      const newStatus = !currentCompleted;
      soundEffects.playToggle(newStatus);
      const updated = await api.toggleTopicCompletion(timetableId, slotId, newStatus);
      setActiveTimetable(updated);
    } catch (err) {
      console.error('Failed to toggle topic:', err);
    }
  };

  const handleReallocate = async () => {
    if (!activeTimetable) return;
    soundEffects.playNextStep();
    setReallocating(true);
    try {
      const updated = await api.reallocateTimetable(activeTimetable.id);
      setActiveTimetable(updated);
      soundEffects.playNotification();
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚡ AI Reallocation Complete! Kept your completed topics intact and redistributed the unfinished syllabus evenly across the remaining days before ${activeTimetable.exam_date || 'your exam'}.`
        }
      ]);
    } catch (err) {
      alert(err.message || 'Failed to reallocate');
    } finally {
      setReallocating(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    soundEffects.playSelect();
    setChatInput('');
    const newMsgList = [...chatMessages, { role: 'user', content: userText }];
    setChatMessages(newMsgList);
    setChatLoading(true);

    try {
      const res = await api.chatTimetable({
        messages: newMsgList.map(m => ({ role: m.role, content: m.content })),
        calendar_schedule: activeTimetable?.calendar_schedule,
        grade: selectedGrade,
        exam_date: examDate
      });

      soundEffects.playNotification();
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);

      if (res.updated_timetable) {
        setActiveTimetable(res.updated_timetable);
        if (res.updated_timetable.exam_date) {
          setExamDate(res.updated_timetable.exam_date);
        }
      } else if (res.suggested_calendar_update) {
        setActiveTimetable(prev => ({
          ...prev,
          calendar_schedule: res.suggested_calendar_update,
          exam_date: res.exam_date || prev?.exam_date
        }));
        if (res.exam_date) {
          setExamDate(res.exam_date);
        }
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Connection issue. Your timetable remains active.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const calendarSchedule = activeTimetable?.calendar_schedule || {};
  const calendarDates = Object.keys(calendarSchedule).sort();
  const completionStats = activeTimetable?.completion_stats || {
    total_topics: 16,
    completed_topics: 0,
    progress_percentage: 0
  };

  return (
    <div className="page-container" style={{ maxWidth: '1440px' }}>
      {/* Weak Areas Notification */}
      {detectedWeakAreas.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="#f87171" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                Adaptive Weak Area Prioritization Active
              </div>
              <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                Detected from your real quiz results: {detectedWeakAreas.slice(0, 2).join(' • ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playNextStep();
              setShowGenerateModal(true);
            }}
            className="btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
          >
            Re-prioritize Weak Chapters
          </button>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.85rem)', fontWeight: 800 }}>Grow My IQ AI Timetable</h1>
            {activeTimetable?.exam_date && (
              <span style={{
                fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.25rem 0.75rem', borderRadius: '8px',
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <Target size={14} />
                <span>Exam Target: {activeTimetable.exam_date}</span>
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {activeTimetable?.description || 'Daily roadmap with real dates, topic completion acknowledgment, and AI reallocation'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleReallocate} disabled={reallocating} className="btn-secondary" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
            <RotateCcw size={16} />
            <span>{reallocating ? 'Reallocating...' : 'Recalibrate Remaining Topics'}</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playNextStep();
              setShowUploadModal(true);
            }}
            className="btn-secondary"
          >
            <Upload size={16} />
            <span>Upload Syllabus (.md / Pic / PDF)</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playNextStep();
              setShowGenerateModal(true);
            }}
            className="btn-primary"
          >
            <Sparkles size={16} />
            <span>Generate Date Schedule</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playToggle(!showChatBot);
              setShowChatBot(!showChatBot);
            }}
            style={{
              background: showChatBot ? 'rgba(110, 168, 163, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${showChatBot ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              color: '#fff', borderRadius: '12px', padding: '0.75rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600
            }}
          >
            <Bot size={18} color="var(--accent-primary)" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Topic Mastery Progress Meter */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#10b981" />
            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Syllabus Mastery Progress</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>
            {completionStats.completed_topics} of {completionStats.total_topics} Topics Finished ({completionStats.progress_percentage}%)
          </span>
        </div>
        <div style={{
          width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)',
          borderRadius: '999px', overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(100, completionStats.progress_percentage)}%`, height: '100%',
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Main Layout: Specific Date Calendar Grid + Side AI Chat */}
      <div className={`timetable-layout-grid ${showChatBot ? 'with-chat' : ''}`}>
        
        {/* Calendar Days Stream */}
        <div className="glass-panel responsive-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          {calendarDates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Calendar size={36} color="var(--accent-primary)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Calendar Timetable Generated Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Set your exam date and syllabus to generate specific day-by-day dates with topic tracking.
              </p>
              <button onClick={() => setShowGenerateModal(true)} className="btn-primary">
                <Sparkles size={16} />
                <span>Create Exam Schedule</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {calendarDates.map(dateKey => {
                const dayData = calendarSchedule[dateKey];
                const isExamDay = dayData.days_until_exam === 0;
                const isNearExam = dayData.days_until_exam > 0 && dayData.days_until_exam <= 3;

                return (
                  <div
                    key={dateKey}
                    style={{
                      background: isExamDay ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '14px',
                      border: `1px solid ${isExamDay ? '#ef4444' : isNearExam ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      padding: '1.25rem 1.5rem'
                    }}
                  >
                    {/* Day Header with exact calendar date */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
                      paddingBottom: '0.85rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          padding: '0.35rem 0.75rem', borderRadius: '8px',
                          background: isExamDay ? '#ef4444' : 'var(--accent-primary)',
                          color: '#0e1312', fontWeight: 800, fontSize: '0.85rem'
                        }}>
                          {dayData.day_name}
                        </div>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                          {dayData.display_date}
                        </span>
                      </div>

                      <div style={{
                        fontSize: '0.8rem', fontWeight: 700,
                        color: isExamDay ? '#ef4444' : isNearExam ? '#fbbf24' : 'var(--text-muted)'
                      }}>
                        {isExamDay ? '🎯 EXAM DAY' : `${dayData.days_until_exam} days to exam`}
                      </div>
                    </div>

                    {/* Slots for this specific date */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                      {dayData.slots.map((slot, sIdx) => {
                        const isStudy = slot.type === 'study' || slot.type === 'revision';
                        const isCompleted = Boolean(slot.completed);

                        return (
                          <div
                            key={slot.slot_id || sIdx}
                            style={{
                              padding: '1rem',
                              borderRadius: '12px',
                              background: isCompleted ? 'rgba(82, 183, 136, 0.15)' :
                                          slot.type === 'exam' ? 'rgba(242, 121, 132, 0.15)' :
                                          slot.type === 'class' ? 'rgba(78, 125, 122, 0.18)' : 'rgba(110, 168, 163, 0.15)',
                              border: isCompleted ? '1px solid rgba(82, 183, 136, 0.4)' : '1px solid var(--border-subtle)',
                              borderLeft: `4px solid ${
                                isCompleted ? '#52b788' :
                                slot.type === 'exam' ? '#f27984' :
                                slot.type === 'class' ? '#4e7d7a' : 'var(--accent-primary)'
                              }`,
                              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <Clock size={12} />
                                  <span>{slot.time}</span>
                                </div>
                                <span style={{
                                  fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                                  padding: '0.15rem 0.5rem', borderRadius: '4px',
                                  background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                                  color: isCompleted ? '#34d399' : 'var(--text-muted)'
                                }}>
                                  {isCompleted ? 'Finished' : slot.type}
                                </span>
                              </div>

                              <div style={{
                                fontSize: '0.92rem', fontWeight: 700, color: '#fff', lineHeight: 1.35,
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                opacity: isCompleted ? 0.85 : 1
                              }}>
                                {slot.activity}
                              </div>
                            </div>

                            {/* Interactive Topic Acknowledgment Checkbox */}
                            {isStudy && (
                              <button
                                type="button"
                                onClick={() => handleToggleTopic(activeTimetable.id, slot.slot_id, isCompleted)}
                                style={{
                                  marginTop: '0.85rem',
                                  padding: '0.45rem 0.75rem',
                                  borderRadius: '8px',
                                  background: isCompleted ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                                  border: `1px solid ${isCompleted ? '#10b981' : 'var(--border-subtle)'}`,
                                  color: isCompleted ? '#34d399' : '#fff',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  alignSelf: 'flex-start'
                                }}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle2 size={15} color="#10b981" />
                                    <span>Finished ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <Check size={14} />
                                    <span>Acknowledge Topic Finished</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side AI Chat Bot */}
        {showChatBot && (
          <div className="glass-panel animate-fade-in timetable-chat-panel">
            {/* Chat Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={18} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Grow My IQ Copilot</h3>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                    Active & Rescheduling
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEffects.playBack();
                  setShowChatBot(false);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Stream */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.25rem' }}>
              {chatMessages.map((msg, mIdx) => (
                <div
                  key={mIdx}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%'
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      lineHeight: 1.45,
                      background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.06)',
                      color: '#fff',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
                  Recalibrating schedule with AI...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {['Move Friday study to Saturday', 'Exam moved to Nov 18', 'School ends at 2:30 pm'].map((qp, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => {
                    soundEffects.playSelect();
                    setChatInput(qp);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
                    borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.75rem',
                    color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'pointer'
                  }}
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder='e.g. "Move exam to Nov 18" or "Add Math Friday"'
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                style={{ padding: '0.65rem 0.9rem', fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="btn-primary"
                style={{ padding: '0.65rem 0.9rem', borderRadius: '10px' }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* AI GENERATE MODAL WITH SPECIFIC DATES */}
      {showGenerateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100, overflowY: 'auto'
        }}>
          <div className="glass-panel animate-fade-in responsive-panel" style={{ width: '100%', maxWidth: '540px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles color="var(--accent-primary)" size={22} />
              AI Date-Based Timetable Generator
            </h3>

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Academic Class
                  </label>
                  <select
                    className="input-field"
                    value={selectedGrade}
                    onChange={e => setSelectedGrade(Number(e.target.value))}
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Target Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Target Subject
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={subjects}
                  onChange={e => setSubjects(e.target.value)}
                  placeholder="e.g. Science, Mathematics"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Prioritized Weak Areas (Auto-Injected from Quizzes)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={weakAreas}
                  onChange={e => setWeakAreas(e.target.value)}
                  placeholder="e.g. Light Reflection, Chemical Equations"
                />
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    School Ending Time
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={schoolEndTime}
                    onChange={e => setSchoolEndTime(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Evening Study: <span style={{ color: 'var(--accent-primary)' }}>{hours}h / day</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer', marginTop: '0.5rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playBack();
                    setShowGenerateModal(false);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={generating} className="btn-primary">
                  {generating ? 'Calculating Calendar Dates...' : 'Generate Date Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD SYLLABUS MODAL (.MD, PICTURE, PDF) */}
      {showUploadModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100, overflowY: 'auto'
        }}>
          <div className="glass-panel animate-fade-in responsive-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={22} color="var(--accent-primary)" />
              Upload Syllabus or Exam Datesheet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Supports <strong>Markdown (.md)</strong>, <strong>Syllabus Pictures (.png, .jpg)</strong>, and <strong>PDFs (.pdf)</strong>. The AI will extract chapters and your exam date automatically.
            </p>

            <form onSubmit={handleSyllabusUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                border: '2px dashed var(--border-subtle)', borderRadius: '12px',
                padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>
                  <FileText size={28} />
                  <Image size={28} />
                </div>
                <input
                  type="file"
                  accept=".pdf,.md,.markdown,.txt,.png,.jpg,.jpeg,.webp"
                  required
                  onChange={e => setUploadFile(e.target.files[0])}
                  style={{ display: 'block', margin: '0 auto', fontSize: '0.85rem' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
                  Markdown (.md), Syllabus Photo (PNG/JPG), or PDF
                </div>
              </div>

              {uploadSuccessMsg && (
                <div style={{
                  padding: '0.75rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.85rem'
                }}>
                  {uploadSuccessMsg}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playBack();
                    setShowUploadModal(false);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="btn-primary">
                  {uploading ? 'Analyzing with AI...' : 'Parse & Extract Syllabus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
