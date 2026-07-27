import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface SimpleRequest {
  message: string;
  currentTimetable?: {
    schedule: {
      [key: string]: Array<any>;
    };
    metadata?: any;
    settings?: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SimpleRequest = await request.json();
    const { message, currentTimetable } = body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Determine if this is a modification or creation
    const isModification = !!currentTimetable;

    let systemPrompt;

    if (isModification) {
      // Modification prompt
      systemPrompt = `You are an AI assistant helping students modify their existing timetable.

CURRENT TIMETABLE:
${JSON.stringify(currentTimetable, null, 2)}

User's modification request: "${message}"

Please update the timetable based on their request. Your response should include:
1. A natural confirmation message about what you changed
2. The complete updated timetable in JSON format

IMPORTANT: Always end your response with the complete updated timetable like this:

[TIMETABLE]
{
  "metadata": {...},
  "schedule": {
    "monday": [...],
    "tuesday": [...],
    "wednesday": [...],
    "thursday": [...],
    "friday": [...]
  },
  "settings": {...}
}
[/TIMETABLE]

The schedule must include all 5 weekdays. Each item must have: time, activity, and type fields.`;
    } else {
      // Creation prompt
      systemPrompt = `You are an AI assistant that creates student timetables. The user said: "${message}"

Extract their schedule information and create a complete weekly timetable.

Your response should:
1. Be friendly and conversational
2. If you need more information, ask for it
3. If you have enough information, create the timetable

IMPORTANT: When creating the timetable, always include it at the end of your response like this:

[TIMETABLE]
{
  "metadata": {
    "schoolType": "High School",
    "gradeLevel": "Grade 10",
    "createdAt": "2025-10-16T12:00:00.000Z"
  },
  "schedule": {
    "monday": [
      {"time": "07:00-08:00", "activity": "Morning Routine", "type": "personal"},
      {"time": "08:00-09:00", "activity": "Breakfast", "type": "meal"},
      {"time": "09:00-10:00", "activity": "Mathematics", "type": "class", "location": "Room 101"},
      {"time": "10:00-11:00", "activity": "Math Study", "type": "study", "priority": "high"},
      {"time": "12:00-13:00", "activity": "Lunch", "type": "meal"},
      {"time": "18:00-19:00", "activity": "Dinner", "type": "meal"},
      {"time": "19:00-21:00", "activity": "Study Session", "type": "study"},
      {"time": "22:00-23:00", "activity": "Free Time", "type": "personal"}
    ],
    "tuesday": [...],
    "wednesday": [...],
    "thursday": [...],
    "friday": [...]
  },
  "settings": {
    "studySessionDuration": 45,
    "breakDuration": 15,
    "preferredStudyTimes": ["Evening"],
    "difficultSubjects": []
  }
}
[/TIMETABLE]

Make sure to:
- Include all 5 weekdays (monday-friday)
- Each schedule item must have: time (e.g., "09:00-10:00"), activity, and type (class, study, meal, personal, activity)
- Add classes, study sessions, meals, and breaks
- Sort items by time for each day`;
    }

    // Generate response
    const result = await model.generateContent(systemPrompt);
    let response = result.response.text();

    console.log('Raw AI response:', response);

    // Extract timetable from response
    let timetable = null;

    // Helper function to clean JSON string
    const cleanJSON = (jsonStr: string): string => {
      // Remove backticks and code blocks
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      jsonStr = jsonStr.replace(/```\n/g, '').replace(/```/g, '');
      jsonStr = jsonStr.replace(/`\s*/g, '');

      // Remove any leading/trailing non-JSON characters
      jsonStr = jsonStr.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

      // Remove extra whitespace and newlines at start/end
      jsonStr = jsonStr.trim();

      // Handle common JSON issues
      jsonStr = jsonStr.replace(/,\s*}/g, '}'); // Remove trailing commas
      jsonStr = jsonStr.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

      return jsonStr;
    };

    // Look for [TIMETABLE] block
    const timetableMatch = response.match(/\[TIMETABLE\]([\s\S]*?)\[\/TIMETABLE\]/);
    if (timetableMatch) {
      try {
        const cleanedJSON = cleanJSON(timetableMatch[1]);
        console.log('Attempting to parse cleaned JSON:', cleanedJSON.substring(0, 200) + '...');
        timetable = JSON.parse(cleanedJSON);
        // Remove the timetable block from the response
        response = response.replace(timetableMatch[0], '').trim();
        console.log('Successfully parsed timetable from [TIMETABLE] block');
      } catch (e) {
        console.error('Error parsing timetable:', e);
        console.error('Failed JSON:', timetableMatch[1]);
        console.error('Cleaned JSON:', cleanJSON(timetableMatch[1]));
      }
    }

    // Fallback 1: Look for JSON in code blocks without TIMETABLE tags
    if (!timetable) {
      const codeBlockMatch = response.match(/```json\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        try {
          const cleanedJSON = cleanJSON(codeBlockMatch[1]);
          console.log('Attempting to parse from code block:', cleanedJSON.substring(0, 200) + '...');
          const potentialTimetable = JSON.parse(cleanedJSON);
          if (potentialTimetable.schedule) {
            timetable = potentialTimetable;
            console.log('Successfully parsed timetable from code block');
          }
        } catch (e) {
          console.error('Error parsing code block:', e);
        }
      }
    }

    // Fallback 2: Look for any JSON object with schedule
    if (!timetable && response.includes('{')) {
      try {
        // Find the largest JSON object
        const jsonMatches = response.match(/\{[\s\S]*\}/g);
        if (jsonMatches) {
          // Try the largest match first
          const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length);
          for (const match of sortedMatches) {
            try {
              const potentialTimetable = JSON.parse(match);
              if (potentialTimetable.schedule && typeof potentialTimetable.schedule === 'object') {
                timetable = potentialTimetable;
                console.log('Successfully parsed fallback timetable from response');
                break;
              }
            } catch (e) {
              // Continue to next match
              continue;
            }
          }
        }
      } catch (e) {
        console.error('Error in fallback parsing:', e);
      }
    }

    // Fallback 3: Try to extract JSON from any remaining text
    if (!timetable) {
      try {
        // Look for schedule array pattern
        const scheduleMatch = response.match(/"schedule"\s*:\s*\{[\s\S]*?\}/);
        if (scheduleMatch) {
          // Wrap it in a complete object structure
          const partialJSON = `"${scheduleMatch[0]}`;
          const fullJSON = `{${partialJSON}}`;
          console.log('Attempting to parse partial JSON:', fullJSON.substring(0, 200) + '...');
          const potentialTimetable = JSON.parse(fullJSON);
          if (potentialTimetable.schedule) {
            timetable = potentialTimetable;
            console.log('Successfully reconstructed timetable from partial JSON');
          }
        }
      } catch (e) {
        console.error('Error parsing partial JSON:', e);
      }
    }

    // If still no timetable and it's a creation request, generate a basic one
    if (!timetable && !isModification) {
      console.log('Generating basic timetable as fallback');
      timetable = generateBasicTimetable();
      response = response + "\n\nI've created a basic timetable for you. You can ask me to modify it anytime!";
    }

    console.log('Final timetable:', timetable);

    return NextResponse.json({
      response,
      timetable
    });

  } catch (error) {
    console.error('Error in AI API:', error);

    return NextResponse.json({
      response: "I'm having trouble right now. Could you try again with different wording?",
      timetable: null
    });
  }
}

// Generate a basic fallback timetable
function generateBasicTimetable() {
  return {
    metadata: {
      schoolType: "Not specified",
      gradeLevel: "Not specified",
      createdAt: new Date().toISOString()
    },
    schedule: {
      monday: [
        { time: "07:00-08:00", activity: "Morning Routine", type: "personal" },
        { time: "08:00-09:00", activity: "Breakfast", type: "meal" },
        { time: "09:00-10:00", activity: "Class", type: "class" },
        { time: "10:00-11:00", activity: "Study", type: "study" },
        { time: "12:00-13:00", activity: "Lunch", type: "meal" },
        { time: "14:00-15:00", activity: "Class", type: "class" },
        { time: "15:00-16:00", activity: "Study", type: "study" },
        { time: "18:00-19:00", activity: "Dinner", type: "meal" },
        { time: "19:00-21:00", activity: "Study Session", type: "study" },
        { time: "22:00-23:00", activity: "Free Time", type: "personal" }
      ],
      tuesday: [
        { time: "07:00-08:00", activity: "Morning Routine", type: "personal" },
        { time: "08:00-09:00", activity: "Breakfast", type: "meal" },
        { time: "09:00-10:00", activity: "Class", type: "class" },
        { time: "10:00-11:00", activity: "Study", type: "study" },
        { time: "12:00-13:00", activity: "Lunch", type: "meal" },
        { time: "14:00-15:00", activity: "Class", type: "class" },
        { time: "15:00-16:00", activity: "Study", type: "study" },
        { time: "18:00-19:00", activity: "Dinner", type: "meal" },
        { time: "19:00-21:00", activity: "Study Session", type: "study" },
        { time: "22:00-23:00", activity: "Free Time", type: "personal" }
      ],
      wednesday: [
        { time: "07:00-08:00", activity: "Morning Routine", type: "personal" },
        { time: "08:00-09:00", activity: "Breakfast", type: "meal" },
        { time: "09:00-10:00", activity: "Class", type: "class" },
        { time: "10:00-11:00", activity: "Study", type: "study" },
        { time: "12:00-13:00", activity: "Lunch", type: "meal" },
        { time: "14:00-15:00", activity: "Class", type: "class" },
        { time: "15:00-16:00", activity: "Activity", type: "activity" },
        { time: "18:00-19:00", activity: "Dinner", type: "meal" },
        { time: "19:00-21:00", activity: "Study Session", type: "study" },
        { time: "22:00-23:00", activity: "Free Time", type: "personal" }
      ],
      thursday: [
        { time: "07:00-08:00", activity: "Morning Routine", type: "personal" },
        { time: "08:00-09:00", activity: "Breakfast", type: "meal" },
        { time: "09:00-10:00", activity: "Class", type: "class" },
        { time: "10:00-11:00", activity: "Study", type: "study" },
        { time: "12:00-13:00", activity: "Lunch", type: "meal" },
        { time: "14:00-15:00", activity: "Class", type: "class" },
        { time: "15:00-16:00", activity: "Study", type: "study" },
        { time: "18:00-19:00", activity: "Dinner", type: "meal" },
        { time: "19:00-21:00", activity: "Study Session", type: "study" },
        { time: "22:00-23:00", activity: "Free Time", type: "personal" }
      ],
      friday: [
        { time: "07:00-08:00", activity: "Morning Routine", type: "personal" },
        { time: "08:00-09:00", activity: "Breakfast", type: "meal" },
        { time: "09:00-10:00", activity: "Class", type: "class" },
        { time: "10:00-11:00", activity: "Study", type: "study" },
        { time: "12:00-13:00", activity: "Lunch", type: "meal" },
        { time: "14:00-15:00", activity: "Class", type: "class" },
        { time: "15:00-16:00", activity: "Activity", type: "activity" },
        { time: "18:00-19:00", activity: "Dinner", type: "meal" },
        { time: "19:00-21:00", activity: "Study Session", type: "study" },
        { time: "22:00-23:00", activity: "Free Time", type: "personal" }
      ]
    },
    settings: {
      studySessionDuration: 45,
      breakDuration: 15,
      preferredStudyTimes: ["Evening"],
      difficultSubjects: []
    }
  };
}

// Helper function to generate timetable from collected info
function generateTimetableFromInfo(context: any) {
  const { collectedClasses, collectedActivities, collectedPreferences, schoolInfo } = context;

  const timetable = {
    metadata: {
      schoolType: schoolInfo.type || 'Not specified',
      gradeLevel: schoolInfo.grade || 'Not specified',
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
      studySessionDuration: 45,
      breakDuration: 15,
      preferredStudyTimes: [collectedPreferences.studyTime || 'Flexible'],
      difficultSubjects: collectedPreferences.difficultSubjects || []
    }
  };

  // Add daily routines
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  weekDays.forEach(day => {
    // Morning routine
    timetable.schedule[day].push({
      time: `${collectedPreferences.wakeTime || '07:00'}-${formatTime(timeToMinutes(collectedPreferences.wakeTime || '07:00') + 60)}`,
      activity: 'Morning Routine',
      type: 'personal'
    });

    // Meals
    timetable.schedule[day].push({
      time: '08:00-09:00',
      activity: 'Breakfast',
      type: 'meal'
    });

    timetable.schedule[day].push({
      time: '12:00-13:00',
      activity: 'Lunch',
      type: 'meal'
    });

    timetable.schedule[day].push({
      time: '18:00-19:00',
      activity: 'Dinner',
      type: 'meal'
    });

    // Sleep
    timetable.schedule[day].push({
      time: `${collectedPreferences.sleepTime || '22:00'}-${formatTime(timeToMinutes(collectedPreferences.sleepTime || '22:00') + 60)}`,
      activity: 'Sleep',
      type: 'personal'
    });
  });

  // Add classes
  collectedClasses.forEach(cls => {
    const day = cls.day.toLowerCase();
    if (timetable.schedule[day]) {
      timetable.schedule[day].push({
        time: `${cls.startTime}-${cls.endTime}`,
        activity: cls.subject,
        type: 'class',
        location: cls.location,
        priority: collectedPreferences.difficultSubjects.includes(cls.subject) ? 'high' : 'medium'
      });

      // Add study session before difficult classes
      if (collectedPreferences.difficultSubjects.includes(cls.subject)) {
        const studyStart = formatTime(timeToMinutes(cls.startTime) - 30);
        timetable.schedule[day].push({
          time: `${studyStart}-${cls.startTime}`,
          activity: `${cls.subject} Review`,
          type: 'study',
          priority: 'high'
        });
      }
    }
  });

  // Add activities
  collectedActivities.forEach(act => {
    act.days.forEach((day: string) => {
      const dayKey = day.toLowerCase();
      if (timetable.schedule[dayKey]) {
        timetable.schedule[dayKey].push({
          time: `${act.startTime}-${act.endTime}`,
          activity: act.name,
          type: 'activity'
        });
      }
    });
  });

  // Add general study sessions
  weekDays.forEach(day => {
    const dayClasses = collectedClasses.filter(c => c.day.toLowerCase() === day);
    if (dayClasses.length > 0) {
      // Add study session after last class
      const lastClass = dayClasses.sort((a, b) => timeToMinutes(b.endTime) - timeToMinutes(a.endTime))[0];
      if (lastClass && timeToMinutes(lastClass.endTime) < timeToMinutes('18:00')) {
        timetable.schedule[day].push({
          time: `${lastClass.endTime}-${formatTime(Math.min(timeToMinutes(lastClass.endTime) + 60, timeToMinutes('18:00')))}`,
          activity: 'Study Session',
          type: 'study'
        });
      }
    }
  });

  // Sort each day's schedule
  Object.keys(timetable.schedule).forEach(day => {
    timetable.schedule[day].sort((a, b) => {
      const timeA = timeToMinutes(a.time.split('-')[0]);
      const timeB = timeToMinutes(b.time.split('-')[0]);
      return timeA - timeB;
    });
  });

  return timetable;
}

// Helper functions
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}