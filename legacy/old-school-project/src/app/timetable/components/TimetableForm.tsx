'use client';

import { useState } from 'react';
import { Clock, Plus, Trash2, ChevronRight, AlertCircle, CheckCircle, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Class {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  location?: string;
}

interface Activity {
  id: string;
  name: string;
  days: string[];
  startTime: string;
  endTime: string;
}

interface TimetableData {
  schoolType: string;
  gradeLevel: string;
  classes: Class[];
  activities: Activity[];
  preferences: {
    preferredStudyTime: string;
    dailyStudyHours: number;
    difficultSubjects: string[];
    wakeUpTime: string;
    sleepTime: string;
    breakFrequency: number;
    studySessionDuration: number;
    breakDuration: number;
    weekendStudy: boolean;
  };
}

interface TimetableOutput {
  metadata: {
    schoolType: string;
    gradeLevel: string;
    createdAt: string;
  };
  schedule: {
    [key: string]: Array<{
      time: string;
      activity: string;
      type: 'class' | 'study' | 'meal' | 'break' | 'activity' | 'personal';
      location?: string;
      priority?: 'high' | 'medium' | 'low';
    }>;
  };
  settings: {
    studySessionDuration: number;
    breakDuration: number;
    preferredStudyTimes: string[];
    difficultSubjects: string[];
  };
}

export function TimetableForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TimetableData>({
    schoolType: '',
    gradeLevel: '',
    classes: [],
    activities: [],
    preferences: {
      preferredStudyTime: '',
      dailyStudyHours: 3,
      difficultSubjects: [],
      wakeUpTime: '07:00',
      sleepTime: '22:00',
      breakFrequency: 1,
      studySessionDuration: 45,
      breakDuration: 15,
      weekendStudy: false
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedTimetable, setGeneratedTimetable] = useState<TimetableOutput | null>(null);
  const [dynamicQuestions, setDynamicQuestions] = useState<Array<{
    question: string;
    field: string;
    options?: string[];
  }>>([]);

  const steps = [
    { id: 'basic', title: 'Basic Information', description: 'School details' },
    { id: 'classes', title: 'Class Schedule', description: 'Your fixed classes' },
    { id: 'preferences', title: 'Study Preferences', description: 'How you study best' },
    { id: 'activities', title: 'Activities', description: 'Extracurriculars' },
    { id: 'generate', title: 'Generate', description: 'Create your timetable' }
  ];

  const schoolTypes = ['High School', 'University/College', 'Middle School', 'Other'];
  const gradeLevels = {
    'High School': ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    'University/College': ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Graduate'],
    'Middle School': ['Grade 6', 'Grade 7', 'Grade 8'],
    'Other': ['Other']
  };
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const studyTimes = ['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-11PM)', 'Flexible'];
  const commonSubjects = ['Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

  // Validation functions
  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const checkScheduleConflict = (newClass: Omit<Class, 'id'>, excludeId?: string): boolean => {
    return formData.classes.some(cls => {
      if (excludeId && cls.id === excludeId) return false;
      if (cls.day !== newClass.day) return false;

      const newStart = timeToMinutes(newClass.startTime);
      const newEnd = timeToMinutes(newClass.endTime);
      const existingStart = timeToMinutes(cls.startTime);
      const existingEnd = timeToMinutes(cls.endTime);

      return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Handle form updates
  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Trigger dynamic questions based on responses
    checkForDynamicQuestions(field, value);
  };

  const updatePreference = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  // Dynamic question system
  const checkForDynamicQuestions = (field: string, value: any) => {
    const questions = [];

    // If difficult subjects are added
    if (field === 'preferences.difficultSubjects' && value.length > 0) {
      questions.push({
        question: `You've marked ${value.join(', ')} as difficult. Would you like extra study sessions for these?`,
        field: 'extraStudyTime',
        options: ['Yes, 30 min extra per subject', 'Yes, 1 hour extra per subject', 'No, regular sessions are fine']
      });
    }

    // If early wake-up time
    if (field === 'preferences.wakeUpTime' && timeToMinutes(value) < 360) {
      questions.push({
        question: 'You wake up quite early! Would you like to use this time for light studying or exercise?',
        field: 'morningActivity',
        options: ['Light study session', 'Exercise/meditation', 'Personal time']
      });
    }

    // If long gaps between classes
    if (field === 'classes' && value.length >= 2) {
      const hasGaps = checkForGaps(value);
      if (hasGaps) {
        questions.push({
          question: 'I notice you have some gaps between classes. What would you prefer to do during these times?',
          field: 'gapActivities',
          options: ['Study in library', 'Review notes', 'Relax/socialize', 'Work on assignments']
        });
      }
    }

    setDynamicQuestions(questions);
  };

  const checkForGaps = (classes: Class[]): boolean => {
    // Check for gaps of more than 1 hour between classes
    for (const day of weekDays) {
      const dayClasses = classes.filter(c => c.day === day).sort((a, b) =>
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );

      for (let i = 0; i < dayClasses.length - 1; i++) {
        const gap = timeToMinutes(dayClasses[i + 1].startTime) - timeToMinutes(dayClasses[i].endTime);
        if (gap > 60) return true;
      }
    }
    return false;
  };

  // Class management
  const addClass = () => {
    const newClass: Class = {
      id: Date.now().toString(),
      subject: '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00'
    };
    setFormData(prev => ({ ...prev, classes: [...prev.classes, newClass] }));
  };

  const updateClass = (id: string, field: keyof Class, value: string) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.map(cls => {
        if (cls.id === id) {
          const updated = { ...cls, [field]: value };

          // Validate if updating time
          if (field === 'startTime' || field === 'endTime' || field === 'day') {
            if (!validateTimeFormat(value) && (field === 'startTime' || field === 'endTime')) {
              setErrors(prev => ({ ...prev, [`${id}-${field}`]: 'Invalid time format. Use HH:MM' }));
            } else if (checkScheduleConflict(updated, id)) {
              setErrors(prev => ({ ...prev, [`${id}-conflict`]: 'This class conflicts with an existing class' }));
            } else {
              setErrors(prev => ({ ...prev, [`${id}-${field}`]: '', [`${id}-conflict`]: '' }));
            }
          }

          return updated;
        }
        return cls;
      })
    }));
  };

  const removeClass = (id: string) => {
    setFormData(prev => ({ ...prev, classes: prev.classes.filter(c => c.id !== id) }));
  };

  // Activity management
  const addActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: '',
      days: [],
      startTime: '16:00',
      endTime: '17:00'
    };
    setFormData(prev => ({ ...prev, activities: [...prev.activities, newActivity] }));
  };

  const updateActivity = (id: string, field: keyof Activity, value: any) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map(act =>
        act.id === id ? { ...act, [field]: value } : act
      )
    }));
  };

  const removeActivity = (id: string) => {
    setFormData(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== id) }));
  };

  // Generate timetable
  const generateTimetable = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.schoolType) newErrors.schoolType = 'School type is required';
    if (!formData.gradeLevel) newErrors.gradeLevel = 'Grade level is required';
    if (formData.classes.length === 0) newErrors.classes = 'At least one class is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Generate the structured timetable
    const timetable: TimetableOutput = {
      metadata: {
        schoolType: formData.schoolType,
        gradeLevel: formData.gradeLevel,
        createdAt: new Date().toISOString()
      },
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      settings: {
        studySessionDuration: formData.preferences.studySessionDuration,
        breakDuration: formData.preferences.breakDuration,
        preferredStudyTimes: [formData.preferences.preferredStudyTime],
        difficultSubjects: formData.preferences.difficultSubjects
      }
    };

    // Add morning and evening routines
    weekDays.forEach(day => {
      const dayLower = day.toLowerCase();
      timetable.schedule[dayLower].push({
        time: `${formData.preferences.wakeUpTime}-${formatTime(timeToMinutes(formData.preferences.wakeUpTime) + 60)}`,
        activity: 'Morning Routine',
        type: 'personal'
      });

      timetable.schedule[dayLower].push({
        time: '07:00-08:00',
        activity: 'Breakfast',
        type: 'meal'
      });

      timetable.schedule[dayLower].push({
        time: '12:00-13:00',
        activity: 'Lunch',
        type: 'meal'
      });

      timetable.schedule[dayLower].push({
        time: '18:00-19:00',
        activity: 'Dinner',
        type: 'meal'
      });

      timetable.schedule[dayLower].push({
        time: `${formData.preferences.sleepTime}-${formatTime(timeToMinutes(formData.preferences.sleepTime) + 60)}`,
        activity: 'Sleep',
        type: 'personal'
      });
    });

    // Add classes
    formData.classes.forEach(cls => {
      const dayLower = cls.day.toLowerCase();
      timetable.schedule[dayLower].push({
        time: `${cls.startTime}-${cls.endTime}`,
        activity: cls.subject,
        type: 'class',
        location: cls.location,
        priority: formData.preferences.difficultSubjects.includes(cls.subject) ? 'high' : 'medium'
      });
    });

    // Add study sessions based on preferences
    weekDays.forEach(day => {
      const dayLower = day.toLowerCase();
      const dayClasses = formData.classes.filter(c => c.day === day).sort((a, b) =>
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );

      // Find gaps between classes for study sessions
      if (dayClasses.length > 0) {
        for (let i = 0; i < dayClasses.length; i++) {
          const currentClass = dayClasses[i];
          const nextClass = dayClasses[i + 1];

          // Add study session before difficult classes
          if (formData.preferences.difficultSubjects.includes(currentClass.subject)) {
            const studyStart = formatTime(timeToMinutes(currentClass.startTime) - 30);
            timetable.schedule[dayLower].push({
              time: `${studyStart}-${currentClass.startTime}`,
              activity: `${currentClass.subject} Review`,
              type: 'study',
              priority: 'high'
            });
          }

          // Add study session after class if there's a gap
          if (nextClass) {
            const gap = timeToMinutes(nextClass.startTime) - timeToMinutes(currentClass.endTime);
            if (gap > 60) {
              const studyStart = currentClass.endTime;
              const studyEnd = formatTime(Math.min(
                timeToMinutes(studyStart) + formData.preferences.studySessionDuration,
                timeToMinutes(nextClass.startTime) - 15
              ));
              timetable.schedule[dayLower].push({
                time: `${studyStart}-${studyEnd}`,
                activity: 'Study Session',
                type: 'study'
              });
            }
          }
        }
      }
    });

    // Add activities
    formData.activities.forEach(activity => {
      activity.days.forEach(day => {
        const dayLower = day.toLowerCase();
        timetable.schedule[dayLower].push({
          time: `${activity.startTime}-${activity.endTime}`,
          activity: activity.name,
          type: 'activity'
        });
      });
    });

    // Sort each day's schedule by time
    Object.keys(timetable.schedule).forEach(day => {
      timetable.schedule[day].sort((a, b) => {
        const timeA = timeToMinutes(a.time.split('-')[0]);
        const timeB = timeToMinutes(b.time.split('-')[0]);
        return timeA - timeB;
      });
    });

    setGeneratedTimetable(timetable);
    setCurrentStep(4);
  };

  // Export functions
  const copyToClipboard = () => {
    if (generatedTimetable) {
      navigator.clipboard.writeText(JSON.stringify(generatedTimetable, null, 2));
      alert('Timetable copied to clipboard!');
    }
  };

  const downloadJSON = () => {
    if (generatedTimetable) {
      const blob = new Blob([JSON.stringify(generatedTimetable, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timetable-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                School Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {schoolTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateForm('schoolType', type)}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.schoolType === type
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.schoolType && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.schoolType}
                </p>
              )}
            </div>

            {formData.schoolType && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grade Level *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {gradeLevels[formData.schoolType as keyof typeof gradeLevels]?.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateForm('gradeLevel', level)}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.gradeLevel === level
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                {errors.gradeLevel && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.gradeLevel}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 1: // Classes
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Class Schedule</h3>
              <Button onClick={addClass} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </div>

            {formData.classes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
                <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No classes added yet</p>
                <p className="text-sm text-gray-500 mt-1">Add your fixed class schedule</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.classes.map((cls, index) => (
                  <div key={cls.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={cls.subject}
                          onChange={(e) => updateClass(cls.id, 'subject', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., Mathematics"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Day
                        </label>
                        <select
                          value={cls.day}
                          onChange={(e) => updateClass(cls.id, 'day', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          {weekDays.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Start Time
                        </label>
                        <input
                          type="text"
                          value={cls.startTime}
                          onChange={(e) => updateClass(cls.id, 'startTime', e.target.value)}
                          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none ${
                            errors[`${cls.id}-startTime`] || errors[`${cls.id}-conflict`]
                              ? 'border-red-500'
                              : 'border-gray-600 focus:border-blue-500'
                          }`}
                          placeholder="09:00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          End Time
                        </label>
                        <input
                          type="text"
                          value={cls.endTime}
                          onChange={(e) => updateClass(cls.id, 'endTime', e.target.value)}
                          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none ${
                            errors[`${cls.id}-endTime`] || errors[`${cls.id}-conflict`]
                              ? 'border-red-500'
                              : 'border-gray-600 focus:border-blue-500'
                          }`}
                          placeholder="10:00"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeClass(cls.id)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <input
                        type="text"
                        value={cls.location || ''}
                        onChange={(e) => updateClass(cls.id, 'location', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:border-blue-500 focus:outline-none"
                        placeholder="Location (optional)"
                      />
                    </div>

                    {(errors[`${cls.id}-startTime`] || errors[`${cls.id}-endTime`] || errors[`${cls.id}-conflict`]) && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors[`${cls.id}-startTime`] || errors[`${cls.id}-endTime`] || errors[`${cls.id}-conflict`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {errors.classes && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.classes}
              </p>
            )}
          </div>
        );

      case 2: // Study Preferences
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Study Preferences</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Study Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                {studyTimes.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => updatePreference('preferredStudyTime', time)}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.preferences.preferredStudyTime === time
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Daily Study Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.preferences.dailyStudyHours}
                  onChange={(e) => updatePreference('dailyStudyHours', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Study Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  step="15"
                  value={formData.preferences.studySessionDuration}
                  onChange={(e) => updatePreference('studySessionDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficult Subjects (for prioritized scheduling)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {commonSubjects.filter(subject =>
                  formData.classes.some(cls => cls.subject.includes(subject))
                ).map(subject => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => {
                      const current = formData.preferences.difficultSubjects;
                      if (current.includes(subject)) {
                        updatePreference('difficultSubjects', current.filter(s => s !== subject));
                      } else {
                        updatePreference('difficultSubjects', [...current, subject]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      formData.preferences.difficultSubjects.includes(subject)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wake Up Time
                </label>
                <input
                  type="text"
                  value={formData.preferences.wakeUpTime}
                  onChange={(e) => updatePreference('wakeUpTime', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="07:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sleep Time
                </label>
                <input
                  type="text"
                  value={formData.preferences.sleepTime}
                  onChange={(e) => updatePreference('sleepTime', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="22:00"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.preferences.weekendStudy}
                  onChange={(e) => updatePreference('weekendStudy', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                Include weekend study sessions
              </label>
            </div>
          </div>
        );

      case 3: // Activities
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Activities</h3>
              <Button onClick={addActivity} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>

            {formData.activities.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
                <p className="text-gray-400">No activities added</p>
                <p className="text-sm text-gray-500 mt-1">Add sports, clubs, or other regular activities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.activities.map(activity => (
                  <div key={activity.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Activity Name
                        </label>
                        <input
                          type="text"
                          value={activity.name}
                          onChange={(e) => updateActivity(activity.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., Basketball"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Days
                        </label>
                        <div className="space-y-1">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                            <label key={day} className="flex items-center gap-2 text-gray-300">
                              <input
                                type="checkbox"
                                checked={activity.days.includes(day)}
                                onChange={(e) => {
                                  const days = e.target.checked
                                    ? [...activity.days, day]
                                    : activity.days.filter(d => d !== day);
                                  updateActivity(activity.id, 'days', days);
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                              />
                              {day}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Start Time
                        </label>
                        <input
                          type="text"
                          value={activity.startTime}
                          onChange={(e) => updateActivity(activity.id, 'startTime', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="16:00"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeActivity(activity.id)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        End Time
                      </label>
                      <input
                        type="text"
                        value={activity.endTime}
                        onChange={(e) => updateActivity(activity.id, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="17:00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4: // Generated Timetable
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Your Generated Timetable</h3>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy JSON
                </Button>
                <Button onClick={downloadJSON}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {generatedTimetable && (
              <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {JSON.stringify(generatedTimetable, null, 2)}
                </pre>
              </div>
            )}

            <Button
              onClick={() => {
                setCurrentStep(0);
                setGeneratedTimetable(null);
              }}
              variant="outline"
              className="w-full"
            >
              Create New Timetable
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => index <= currentStep && setCurrentStep(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                index === currentStep
                  ? 'bg-blue-600 text-white'
                  : index < currentStep
                  ? 'bg-green-600/20 text-green-400 border border-green-600'
                  : 'bg-gray-700/50 text-gray-400'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                index < currentStep ? 'bg-green-600' : ''
              }`}>
                {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </span>
              <span className="hidden md:inline">{step.title}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-600 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Dynamic Questions */}
      {dynamicQuestions.length > 0 && currentStep > 0 && (
        <div className="mb-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Quick Questions</h4>
          {dynamicQuestions.map((q, idx) => (
            <div key={idx} className="mb-3">
              <p className="text-sm text-gray-300 mb-2">{q.question}</p>
              <div className="flex flex-wrap gap-2">
                {q.options?.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      // Handle the dynamic question response
                      setDynamicQuestions([]);
                    }}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {currentStep < 4 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 0 && (!formData.schoolType || !formData.gradeLevel)) ||
                (currentStep === 1 && formData.classes.length === 0)
              }
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={generateTimetable}
              className="bg-green-600 hover:bg-green-700"
            >
              Generate Timetable
            </Button>
          )}
        </div>
      )}
    </div>
  );
}