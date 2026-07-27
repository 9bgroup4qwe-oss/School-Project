interface ConversationContext {
  phase: 'welcome' | 'basics' | 'schedule' | 'preferences' | 'activities' | 'optimization' | 'complete';
  schoolType: string;
  gradeLevel: string;
  classes: Array<{
    name: string;
    day: string;
    startTime: string;
    endTime: string;
  }>;
  studyPreferences: {
    preferredTime: string;
    dailyHours: number;
    difficultSubjects: string[];
  };
  activities: Array<{
    name: string;
    day: string;
    startTime: string;
    endTime: string;
  }>;
  personalInfo: {
    wakeTime: string;
    sleepTime: string;
    breakFrequency: number;
  };
}

export class AIService {
  private context: ConversationContext = {
    phase: 'welcome',
    schoolType: '',
    gradeLevel: '',
    classes: [],
    studyPreferences: {
      preferredTime: '',
      dailyHours: 0,
      difficultSubjects: []
    },
    activities: [],
    personalInfo: {
      wakeTime: '07:00',
      sleepTime: '22:00',
      breakFrequency: 1
    }
  };

  async generateResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}>): Promise<{
    response: string;
    quickReplies?: string[];
    extractedData?: any;
    phase?: string;
  }> {
    try {
      // Call the API route
      const response = await fetch('/api/ai/timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          context: this.context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update context if needed
      if (data.extractedData) {
        this.updateContext(data.extractedData);
      }

      // Update phase from response if provided
      if (data.phase && data.phase !== this.context.phase) {
        this.context.phase = data.phase;
      }

      // Auto-advance phases based on collected information
      this.autoAdvancePhase();

      return {
        response: data.response,
        quickReplies: data.quickReplies,
        extractedData: data.extractedData,
        phase: this.context.phase
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        response: "I'm having trouble connecting right now. Let's continue building your timetable manually. What would you like to add?",
        quickReplies: ['Add classes', 'Set study times', 'Add breaks', 'Generate now'],
        phase: this.context.phase
      };
    }
  }

  private autoAdvancePhase(): void {
    switch (this.context.phase) {
      case 'welcome':
        if (this.context.schoolType) {
          this.context.phase = 'basics';
        }
        break;
      case 'basics':
        if (this.context.gradeLevel) {
          this.context.phase = 'schedule';
        }
        break;
      case 'schedule':
        if (this.context.classes.length >= 3) { // Have at least some classes
          this.context.phase = 'preferences';
        }
        break;
      case 'preferences':
        if (this.context.studyPreferences.preferredTime || this.context.studyPreferences.dailyHours > 0) {
          this.context.phase = 'activities';
        }
        break;
      case 'activities':
        if (this.context.activities.length >= 1 || this.hasAllWeekdaysCovered()) {
          this.context.phase = 'optimization';
        }
        break;
      case 'optimization':
        if (this.context.personalInfo.wakeTime && this.context.personalInfo.sleepTime) {
          this.context.phase = 'complete';
        }
        break;
    }
  }

  private hasAllWeekdaysCovered(): boolean {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const coveredDays = new Set(this.context.classes.map(c => c.day));
    return weekdays.some(day => coveredDays.has(day));
  }

  private buildPrompt(userMessage: string, conversationHistory: Array<{role: string, content: string}>): string {
    const systemPrompt = `You are an AI timetable assistant specializing in creating personalized study schedules for students.
    Your goal is to gather information through a friendly conversation and generate an optimized weekly timetable.

    Current conversation phase: ${this.context.phase}
    School type: ${this.context.schoolType || 'Not set'}
    Grade level: ${this.context.gradeLevel || 'Not set'}
    Classes collected: ${this.context.classes.length}

    Follow this conversation flow:
    1. Welcome (phase: welcome): Ask about school type
    2. Grade Level (phase: basics): Ask about grade/year
    3. Classes (phase: schedule): Collect fixed class schedules day by day
    4. Study Preferences (phase: preferences): Ask about study habits
    5. Activities (phase: activities): Gather extracurricular activities
    6. Personal Info (phase: optimization): Ask about sleep times, breaks
    7. Complete (phase: complete): Generate the final timetable

    Always provide:
    - A friendly, conversational response
    - 3-4 quick reply options for easy interaction
    - Ask only one question at a time
    - Keep responses concise and focused

    IMPORTANT: When the user provides information, extract it using the appropriate format:

    For school type: [DATA]{"type": "school_type", "schoolType": "High School"}[/DATA]
    For grade level: [DATA]{"type": "grade_level", "gradeLevel": "Grade 10"}[/DATA]
    For classes: [DATA]{"type": "class", "subject": "Mathematics", "day": "Monday", "startTime": "09:00", "endTime": "10:00"}[/DATA]
    For activities: [DATA]{"type": "activity", "name": "Basketball", "day": "Wednesday", "startTime": "16:00", "endTime": "18:00"}[/DATA]
    For personal info: [DATA]{"type": "personal_info", "wakeTime": "07:00", "sleepTime": "22:00", "breakFrequency": 1}[/DATA]

    For the final timetable, provide structured data like this:
    [TIMETABLE]
    {
      "monday": [
        {"time": "06:00-07:00", "activity": "Morning Routine", "type": "personal"},
        {"time": "07:00-08:00", "activity": "Breakfast", "type": "meal"},
        {"time": "08:00-09:00", "activity": "Mathematics Study", "type": "study"},
        {"time": "09:00-10:00", "activity": "Mathematics Class", "type": "class", "location": "Room 101"},
        {"time": "12:00-13:00", "activity": "Lunch", "type": "meal"}
      ],
      "tuesday": [...]
    }
    [/TIMETABLE]

    Recent conversation:
    ${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    User's latest message: "${userMessage}"

    Based on the current phase (${this.context.phase}), respond appropriately. If the user is providing information (like a school type or class schedule), extract it using the [DATA] format.`;

    return systemPrompt;
  }

  private parseAIResponse(response: string): {
    text: string;
    quickReplies?: string[];
    extractedData?: any;
  } {
    let cleanText = response;
    let extractedData: any = null;
    let quickReplies: string[] = [];

    // Extract structured data
    const dataMatches = response.match(/\[DATA\]([\s\S]*?)\[\/DATA\]/g);
    if (dataMatches) {
      // Handle multiple data extractions
      const allData = [];
      for (const match of dataMatches) {
        const jsonMatch = match.match(/\[DATA\]([\s\S]*?)\[\/DATA\]/);
        if (jsonMatch) {
          try {
            const data = JSON.parse(jsonMatch[1]);
            allData.push(data);
            cleanText = cleanText.replace(match, '').trim();
          } catch (e) {
            console.error('Error parsing extracted data:', e);
          }
        }
      }
      // Use the last extracted data
      if (allData.length > 0) {
        extractedData = allData[allData.length - 1];
      }
    }

    // Extract timetable data
    const timetableMatch = response.match(/\[TIMETABLE\]([\s\S]*?)\[\/TIMETABLE\]/);
    if (timetableMatch) {
      try {
        extractedData = {
          type: 'timetable',
          data: JSON.parse(timetableMatch[1])
        };
        cleanText = cleanText.replace(timetableMatch[0], '').trim();
      } catch (e) {
        console.error('Error parsing timetable:', e);
      }
    }

    // Generate quick replies based on context
    if (this.context.phase === 'welcome') {
      if (!this.context.schoolType) {
        quickReplies = ['High School', 'University/College', 'Middle School', 'Other'];
      } else {
        quickReplies = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'First Year', 'Second Year', 'Other'];
      }
    } else if (this.context.phase === 'basics' && !this.context.gradeLevel) {
      if (this.context.schoolType === 'High School') {
        quickReplies = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
      } else if (this.context.schoolType === 'University/College') {
        quickReplies = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
      } else {
        quickReplies = ['Grade 6', 'Grade 7', 'Grade 8', 'Other'];
      }
    } else if (this.context.phase === 'schedule') {
      quickReplies = ['Add Monday classes', 'Add Tuesday classes', 'Add Wednesday classes', 'No more classes'];
    } else if (this.context.phase === 'preferences') {
      quickReplies = ['Morning person (6AM-12PM)', 'Afternoon person (12PM-6PM)', 'Evening person (6PM-11PM)', 'Flexible'];
    } else if (this.context.phase === 'activities') {
      quickReplies = ['Sports', 'Music/Art', 'Clubs', 'Part-time job', 'None'];
    } else if (this.context.phase === 'optimization') {
      quickReplies = ['Generate timetable', 'Add more activities', 'Adjust study times', 'Looks good'];
    }

    // If AI provided specific replies in brackets, extract them
    const repliesMatch = response.match(/\[QUICK_REPLIES\]([\s\S]*?)\[\/QUICK_REPLIES\]/);
    if (repliesMatch) {
      try {
        const replies = JSON.parse(repliesMatch[1]);
        quickReplies = Array.isArray(replies) ? replies : [];
        cleanText = cleanText.replace(repliesMatch[0], '').trim();
      } catch (e) {
        console.error('Error parsing quick replies:', e);
      }
    }

    return {
      text: cleanText,
      quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
      extractedData
    };
  }

  private updateContext(data: any): void {
    if (!data || !data.type) return;

    console.log('Updating context with:', data);

    // Update context based on extracted data
    switch (data.type) {
      case 'class':
        this.context.classes.push({
          name: data.subject || data.name,
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location
        });
        break;

      case 'school_type':
        this.context.schoolType = data.schoolType;
        break;

      case 'grade_level':
        this.context.gradeLevel = data.gradeLevel;
        break;

      case 'study_preference':
        this.context.studyPreferences = {
          ...this.context.studyPreferences,
          preferredTime: data.preferredTime || this.context.studyPreferences.preferredTime,
          dailyHours: data.dailyHours || this.context.studyPreferences.dailyHours,
          difficultSubjects: data.difficultSubjects || this.context.studyPreferences.difficultSubjects
        };
        break;

      case 'activity':
        this.context.activities.push({
          name: data.name,
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime
        });
        break;

      case 'personal_info':
        this.context.personalInfo = {
          ...this.context.personalInfo,
          wakeTime: data.wakeTime || this.context.personalInfo.wakeTime,
          sleepTime: data.sleepTime || this.context.personalInfo.sleepTime,
          breakFrequency: data.breakFrequency || this.context.personalInfo.breakFrequency
        };
        break;

      case 'timetable':
        this.context.phase = 'complete';
        break;
    }
  }

  getContext(): ConversationContext {
    return { ...this.context };
  }

  resetContext(): void {
    this.context = {
      phase: 'welcome',
      schoolType: '',
      gradeLevel: '',
      classes: [],
      studyPreferences: {
        preferredTime: '',
        dailyHours: 0,
        difficultSubjects: []
      },
      activities: [],
      personalInfo: {
        wakeTime: '07:00',
        sleepTime: '22:00',
        breakFrequency: 1
      }
    };
  }
}

// Export singleton instance
export const aiService = new AIService();