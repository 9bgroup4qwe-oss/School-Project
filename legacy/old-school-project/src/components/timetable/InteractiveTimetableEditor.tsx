'use client';

import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Pencil, Trash2, Plus, Clock, MapPin, Save, X } from 'lucide-react';
import { TimetableData, TimetableSlot } from '@/types/timetable';

interface InteractiveTimetableEditorProps {
  timetable: TimetableData;
  onSave: (timetable: TimetableData) => void;
  onCancel: () => void;
}

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ACTIVITY_TYPES = [
  { value: 'class', label: 'Class', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'study', label: 'Study', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'meal', label: 'Meal', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'break', label: 'Break', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'activity', label: 'Activity', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'personal', label: 'Personal', color: 'bg-gray-100 text-gray-700 border-gray-200' }
];

export function InteractiveTimetableEditor({ timetable, onSave, onCancel }: InteractiveTimetableEditorProps) {
  const [editTimetable, setEditTimetable] = useState<TimetableData>({ ...timetable });
  const [editingCell, setEditingCell] = useState<{ day: string; time: string } | null>(null);
  const [newActivity, setNewActivity] = useState<Partial<TimetableSlot>>({
    activity: '',
    type: 'study',
    location: ''
  });

  // Initialize empty slots if they don't exist
  const initializeTimetable = useCallback(() => {
    const initialized = { ...editTimetable };
    DAYS.forEach(day => {
      if (!initialized.schedule[day]) {
        initialized.schedule[day] = {};
      }
      TIME_SLOTS.forEach(time => {
        if (!initialized.schedule[day][time]) {
          initialized.schedule[day][time] = {
            time,
            activity: '',
            type: 'personal',
            location: ''
          };
        }
      });
    });
    return initialized;
  }, [editTimetable]);

  // Handle drag end
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Parse day and time from droppableId
    const [sourceDay, sourceTime] = source.droppableId.split('-');
    const [destDay, destTime] = destination.droppableId.split('-');

    const newTimetable = { ...editTimetable };
    const sourceActivity = newTimetable.schedule[sourceDay]?.[sourceTime];
    const destActivity = newTimetable.schedule[destDay]?.[destTime];

    // Swap activities
    if (sourceActivity && destActivity) {
      newTimetable.schedule[sourceDay][sourceTime] = destActivity;
      newTimetable.schedule[destDay][destTime] = sourceActivity;
      setEditTimetable(newTimetable);
    }
  }, [editTimetable]);

  // Start editing a cell
  const startEditing = useCallback((day: string, time: string) => {
    const slot = editTimetable.schedule[day][time];
    setEditingCell({ day, time });
    setNewActivity({
      activity: slot?.activity || '',
      type: slot?.type || 'personal',
      location: slot?.location || ''
    });
  }, [editTimetable]);

  // Save edited cell
  const saveEditedCell = useCallback(() => {
    if (!editingCell) return;

    const newTimetable = { ...editTimetable };
    newTimetable.schedule[editingCell.day][editingCell.time] = {
      time: editingCell.time,
      activity: newActivity.activity || '',
      type: newActivity.type as any || 'personal',
      location: newActivity.location || ''
    };

    setEditTimetable(newTimetable);
    setEditingCell(null);
    setNewActivity({ activity: '', type: 'study', location: '' });
  }, [editingCell, newActivity, editTimetable]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingCell(null);
    setNewActivity({ activity: '', type: 'study', location: '' });
  }, []);

  // Clear a cell
  const clearCell = useCallback((day: string, time: string) => {
    const newTimetable = { ...editTimetable };
    newTimetable.schedule[day][time] = {
      time,
      activity: '',
      type: 'personal',
      location: ''
    };
    setEditTimetable(newTimetable);
  }, [editTimetable]);

  // Get activity type styling
  const getActivityStyle = (type: string) => {
    const activityType = ACTIVITY_TYPES.find(t => t.value === type);
    return activityType ? activityType.color : ACTIVITY_TYPES[5].color;
  };

  const currentTimetable = initializeTimetable();

  return (
    <div className="interactive-timetable-editor">
      <div className="editor-header">
        <h3 className="text-xl font-semibold text-gray-800">Edit Timetable</h3>
        <div className="editor-actions">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            onClick={() => onSave(editTimetable)}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="editor-instructions">
        <p className="text-sm text-gray-600">
          Drag and drop activities to move them • Click to edit • Use the icons to clear cells
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="timetable-edit-grid">
          {/* Header row */}
          <div className="grid-header">
            <div className="time-header">Time</div>
            {DAYS.map(day => (
              <div key={day} className="day-header">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Time slots */}
          {TIME_SLOTS.map(time => (
            <div key={time} className="time-row">
              <div className="time-label">{time}</div>
              {DAYS.map(day => {
                const slot = currentTimetable.schedule[day]?.[time];
                const isEditing = editingCell?.day === day && editingCell?.time === time;

                return (
                  <Droppable
                    key={`${day}-${time}`}
                    droppableId={`${day}-${time}`}
                    isDropDisabled={false}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`timetable-cell ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        onClick={() => !isEditing && startEditing(day, time)}
                      >
                        {slot?.activity && !isEditing ? (
                          <Draggable
                            draggableId={`${day}-${time}-${slot.activity}`}
                            index={0}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`activity-item ${getActivityStyle(slot.type)} ${snapshot.isDragging ? 'dragging' : ''}`}
                              >
                                <div className="activity-content">
                                  <span className="activity-name">{slot.activity}</span>
                                  {slot.location && (
                                    <span className="activity-location">
                                      <MapPin className="w-3 h-3" />
                                      {slot.location}
                                    </span>
                                  )}
                                </div>
                                <div className="cell-actions">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditing(day, time);
                                    }}
                                    className="action-btn edit-btn"
                                    title="Edit"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearCell(day, time);
                                    }}
                                    className="action-btn delete-btn"
                                    title="Clear"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ) : isEditing ? (
                          <div className="cell-editor">
                            <input
                              type="text"
                              placeholder="Activity"
                              value={newActivity.activity}
                              onChange={(e) => setNewActivity({ ...newActivity, activity: e.target.value })}
                              className="activity-input"
                              autoFocus
                            />
                            <select
                              value={newActivity.type}
                              onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                              className="type-select"
                            >
                              {ACTIVITY_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Location (optional)"
                              value={newActivity.location}
                              onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                              className="location-input"
                            />
                            <div className="editor-actions">
                              <button
                                onClick={saveEditedCell}
                                className="save-btn"
                                title="Save"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="cancel-btn"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="empty-cell">
                            <Plus className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-400">Add activity</span>
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Legend */}
      <div className="activity-legend">
        <h4 className="legend-title">Activity Types</h4>
        <div className="legend-items">
          {ACTIVITY_TYPES.map(type => (
            <div key={type.value} className="legend-item">
              <div className={`legend-color ${type.color}`}></div>
              <span>{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}