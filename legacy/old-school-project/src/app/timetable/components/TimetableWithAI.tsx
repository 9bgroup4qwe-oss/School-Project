'use client';

import { useState, useCallback } from 'react';
import { Calendar, Loader2, Cloud, Database, MessageCircle, Upload, BookOpen, Clock } from 'lucide-react';
import { TimetableData } from '@/types/timetable';
import { useTimetableState, useChatState } from '@/hooks/useTimetableState';
import { ChatInterface } from '@/components/timetable/ChatInterface';
import { OptimizedVisualTimetable } from '@/components/timetable/OptimizedVisualTimetable';
import { TimetableSync } from '@/utils/timetableSync';
import { PortionSheetUpload } from '@/components/timetable/PortionSheetUpload';
import { InteractiveTimetableEditor } from '@/components/timetable/InteractiveTimetableEditor';
// import { ProgressTracker } from '@/components/timetable/ProgressTracker';
import { TimableViewFilters } from '@/components/timetable/TimableViewFilters';
import { TimetableListView } from '@/components/timetable/TimetableListView';
import { TimetableCalendarView } from '@/components/timetable/TimetableCalendarView';
import { NotificationSystem } from '@/components/timetable/NotificationSystem';
import '@/styles/timetable-upload.css';
import '@/styles/timetable-calendar.css';
import { mockTimetableData } from '@/lib/mockData';

export function TimetableWithAI() {
  // State for portion sheet
  const [syllabusData, setSyllabusData] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showInteractiveEdit, setShowInteractiveEdit] = useState(false);
  const [filteredTimetable, setFilteredTimetable] = useState<TimetableData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');

  // Use extracted hooks for state management
  const {
    timetable,
    isSaving,
    showSuccess,
    copied,
    saveTimetable,
    copyToClipboard,
    downloadJSON,
    setShowSuccess
  } = useTimetableState();

  const {
    showChat,
    messages,
    inputValue,
    isLoading,
    setShowChat,
    setInputValue,
    handleSendMessage,
    handleKeyPress
  } = useChatState(timetable, saveTimetable);

  // Handle file processed
  const handleFileProcessed = (data: any) => {
    setSyllabusData(data);
    setShowUpload(false);
    // Show success notification
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Debug view mode changes
  const handleViewModeChange = (newMode: 'grid' | 'list' | 'calendar') => {
    console.log('View mode changing to:', newMode);
    setViewMode(newMode);
  };

  // Handle error
  const handleError = (error: string) => {
    console.error('Upload error:', error);
    // You could show a toast notification here
  };

  // Memoize the filtered data handler
  const handleFilteredData = useCallback((data: TimetableData) => {
    setFilteredTimetable(prev => {
      // Only update if data has actually changed
      if (JSON.stringify(prev) !== JSON.stringify(data)) {
        return data;
      }
      return prev;
    });
  }, []);

  
  return (
    <div className="timetable-with-ai">
      {/* Success Notification */}
      {showSuccess && (
        <div className="success-notification">
          <div className="success-content">
            <Calendar className="w-6 h-6 text-green-500" />
            <span>Timetable saved successfully!</span>
          </div>
        </div>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <div className="saving-indicator">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving timetable...</span>
        </div>
      )}

      {/* Storage Location Indicator */}
      {timetable && (
        <div className="storage-indicator">
          {timetable.saved_to === 'localStorage' ? (
            <div className="storage-local">
              <Database className="w-4 h-4" />
              <span>{TimetableSync.getStorageMessage(timetable)}</span>
            </div>
          ) : (
            <div className="storage-cloud">
              <Cloud className="w-4 h-4" />
              <span>{TimetableSync.getStorageMessage(timetable)}</span>
            </div>
          )}
        </div>
      )}

      {/* Filters and View Options */}
      {timetable && !showInteractiveEdit && (
        <TimableViewFilters
          timetable={filteredTimetable || timetable}
          onFilteredData={handleFilteredData}
          onViewModeChange={handleViewModeChange}
        />
      )}

      {/* Main Visual Timetable */}
      <div className="timetable-main">
        {showInteractiveEdit && timetable ? (
          <InteractiveTimetableEditor
            timetable={timetable}
            onSave={(updatedTimetable) => {
              saveTimetable(updatedTimetable);
              setShowInteractiveEdit(false);
            }}
            onCancel={() => setShowInteractiveEdit(false)}
          />
        ) : timetable ? (
          (() => {
            console.log('Current viewMode:', viewMode);
            if (viewMode === 'list') {
              return <TimetableListView timetable={filteredTimetable || timetable} />;
            } else if (viewMode === 'calendar') {
              return <TimetableCalendarView timetable={filteredTimetable || timetable} />;
            } else {
              return (
                <OptimizedVisualTimetable
                  timetable={filteredTimetable || timetable}
                  onEdit={() => setShowChat(true)}
                  onInteractiveEdit={() => setShowInteractiveEdit(true)}
                />
              );
            }
          })()
        ) : (
          /* No Timetable State */
          <div className="no-timetable">
            <div className="no-timetable-content">
              <Calendar size={80} className="text-gray-600" />
              <h2>No Timetable Yet</h2>
              <p>Start by uploading your portion sheet for AI-assisted planning</p>

              <div className="no-timetable-actions">
                <button
                  onClick={() => {
                    saveTimetable(mockTimetableData);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                  }}
                  style={{
                    background: 'var(--timetable-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'var(--timetable-transition)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Load Sample Timetable
                </button>

                <button
                  onClick={() => setShowUpload(true)}
                  style={{
                    background: 'var(--timetable-surface)',
                    color: 'var(--timetable-text)',
                    border: '2px solid var(--timetable-border)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'var(--timetable-transition)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Portion Sheet
                </button>

                <button
                  onClick={() => setShowChat(true)}
                  style={{
                    background: 'transparent',
                    color: 'var(--timetable-text-secondary)',
                    border: '1px solid var(--timetable-border)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'var(--timetable-transition)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Create Manually
                </button>
              </div>

              {syllabusData && (
                <div className="syllabus-summary">
                  <h3>Syllabus Analyzed!</h3>
                  <div className="summary-stats">
                    <div className="stat-item">
                      <BookOpen className="w-4 h-4" />
                      <span>{syllabusData.totalSubjects} Subjects</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{syllabusData.subjects?.reduce((acc: number, s: any) => acc + s.totalChapters, 0) || 0}</span>
                      <span>Chapters</span>
                    </div>
                    {syllabusData.daysUntilExam && (
                      <div className="stat-item">
                        <Clock className="w-4 h-4" />
                        <span>{syllabusData.daysUntilExam} Days to Exam</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowChat(true)}
                    className="create-timetable-btn mt-4"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Generate Timetable
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Assistant */}
      <ChatInterface
        showChat={showChat}
        messages={messages}
        inputValue={inputValue}
        isLoading={isLoading}
        timetable={timetable}
        onShowChatChange={setShowChat}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
        onCopy={copyToClipboard}
        onDownload={downloadJSON}
        copied={copied}
      />

      {/* Portion Sheet Upload Modal */}
      {showUpload && (
        <div className="upload-modal-overlay">
          <div className="upload-modal">
            <div className="upload-modal-header">
              <h2>Upload Your Portion Sheet</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            <div className="upload-modal-content">
              <PortionSheetUpload
                onFileProcessed={handleFileProcessed}
                onError={handleError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress Tracker - Temporarily Disabled */}
      {/* {timetable && !showInteractiveEdit && (
        <ProgressTracker timetable={timetable} />
      )} */}

      {/* Notification System */}
      <NotificationSystem timetable={timetable} />
    </div>
  );
}