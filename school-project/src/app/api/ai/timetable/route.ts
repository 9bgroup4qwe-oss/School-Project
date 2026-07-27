import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface TimetableRequest {
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  context: {
    phase: string;
    schoolType: string;
    gradeLevel: string;
    classes: any[];
    studyPreferences: any;
    activities: any[];
    personalInfo: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: TimetableRequest = await request.json();
    const { message, conversationHistory, context } = body;

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build the conversation for Gemini
    const systemPrompt = `You are an AI timetable assistant specializing in creating personalized study schedules for students.
Your goal is to gather information through a friendly conversation and generate an optimized weekly timetable.

Current conversation phase: ${context.phase}
School type: ${context.schoolType || 'Not set'}
Grade level: ${context.gradeLevel || 'Not set'}
Classes collected: ${context.classes.length}
Study preferences: ${JSON.stringify(context.studyPreferences)}

Follow this conversation flow:
1. Welcome (phase: welcome): Ask about school type
2. Grade Level (phase: basics): Ask about grade/year
3. Classes (phase: schedule): Collect fixed class schedules day by day
4. Study Preferences (phase: preferences): Ask about study habits
5. Activities (phase: activities): Gather extracurricular activities
6. Personal Info (phase: optimization): Ask about sleep times, breaks
7. Complete (phase: complete): Generate the final timetable

Guidelines:
- Always be friendly and conversational
- Ask only one question at a time
- Provide 3-4 quick reply options
- Keep responses concise and focused
- Extract information using the exact format specified below

Data Extraction Format:
For school type: [DATA]{"type": "school_type", "schoolType": "High School"}[/DATA]
For grade level: [DATA]{"type": "grade_level", "gradeLevel": "Grade 10"}[/DATA]
For classes: [DATA]{"type": "class", "subject": "Mathematics", "day": "Monday", "startTime": "09:00", "endTime": "10:00"}[/DATA]
For activities: [DATA]{"type": "activity", "name": "Basketball", "day": "Wednesday", "startTime": "16:00", "endTime": "18:00"}[/DATA]
For personal info: [DATA]{"type": "personal_info", "wakeTime": "07:00", "sleepTime": "22:00", "breakFrequency": 1}[/DATA]

Final Timetable Format:
[TIMETABLE]
{
  "monday": [
    {"time": "06:00-07:00", "activity": "Morning Routine", "type": "personal"},
    {"time": "07:00-08:00", "activity": "Breakfast", "type": "meal"},
    {"time": "08:00-09:00", "activity": "Mathematics Study", "type": "study"},
    {"time": "09:00-10:00", "activity": "Mathematics Class", "type": "class", "location": "Room 101"},
    {"time": "12:00-13:00", "activity": "Lunch", "type": "meal"}
  ],
  "tuesday": [
    {"time": "06:00-07:00", "activity": "Morning Routine", "type": "personal"},
    {"time": "07:00-08:00", "activity": "Breakfast", "type": "meal"},
    {"time": "09:00-10:00", "activity": "Physics Class", "type": "class", "location": "Room 205"},
    {"time": "10:00-11:00", "activity": "Physics Study", "type": "study"},
    {"time": "12:00-13:00", "activity": "Lunch", "type": "meal"}
  ]
}
[/TIMETABLE]

Recent conversation history:
${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User's latest message: "${message}"

Based on the current phase (${context.phase}), respond appropriately. If the user provides information, extract it using the [DATA] format. If you have enough information and the user asks for a timetable, generate it using the [TIMETABLE] format.`;

    // Build the conversation as a single prompt with history
    let fullPrompt = systemPrompt + "\n\n";

    // Add conversation history
    conversationHistory.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });

    // Add current message
    fullPrompt += `User: ${message}\n\nAssistant:`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    // Parse the response
    let cleanText = response.trim();
    let extractedData: any = null;
    let quickReplies: string[] = [];

    // Clean markdown code blocks if present
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    // Extract structured data
    const dataMatches = cleanText.match(/\[DATA\]([\s\S]*?)\[\/DATA\]/g);
    if (dataMatches) {
      const allData = [];
      for (const match of dataMatches) {
        const jsonMatch = match.match(/\[DATA\]([\s\S]*?)\[\/DATA\]/);
        if (jsonMatch) {
          try {
            const data = JSON.parse(jsonMatch[1].trim());
            allData.push(data);
            cleanText = cleanText.replace(match, '').trim();
          } catch (e) {
            console.error('Error parsing extracted data:', e, jsonMatch[1]);
          }
        }
      }
      if (allData.length > 0) {
        extractedData = allData[allData.length - 1];
      }
    }

    // Extract timetable data
    const timetableMatch = cleanText.match(/\[TIMETABLE\]([\s\S]*?)\[\/TIMETABLE\]/);
    if (timetableMatch) {
      try {
        const timetableData = JSON.parse(timetableMatch[1].trim());
        extractedData = {
          type: 'timetable',
          data: timetableData
        };
        cleanText = cleanText.replace(timetableMatch[0], '').trim();
      } catch (e) {
        console.error('Error parsing timetable:', e);
      }
    }

    // Extract quick replies if in brackets
    const repliesMatch = cleanText.match(/\[QUICK_REPLIES\]([\s\S]*?)\[\/QUICK_REPLIES\]/);
    if (repliesMatch) {
      try {
        const replies = JSON.parse(repliesMatch[1].trim());
        quickReplies = Array.isArray(replies) ? replies : [];
        cleanText = cleanText.replace(repliesMatch[0], '').trim();
      } catch (e) {
        console.error('Error parsing quick replies:', e);
      }
    }

    // Generate quick replies
    if (context.phase === 'welcome') {
      if (!context.schoolType) {
        quickReplies = ['High School', 'University/College', 'Middle School', 'Other'];
      } else {
        quickReplies = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'First Year', 'Second Year', 'Other'];
      }
    } else if (context.phase === 'basics' && !context.gradeLevel) {
      if (context.schoolType === 'High School') {
        quickReplies = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
      } else if (context.schoolType === 'University/College') {
        quickReplies = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
      } else {
        quickReplies = ['Grade 6', 'Grade 7', 'Grade 8', 'Other'];
      }
    } else if (context.phase === 'schedule') {
      quickReplies = ['Add Monday classes', 'Add Tuesday classes', 'Add Wednesday classes', 'No more classes'];
    } else if (context.phase === 'preferences') {
      quickReplies = ['Morning person (6AM-12PM)', 'Afternoon person (12PM-6PM)', 'Evening person (6PM-11PM)', 'Flexible'];
    } else if (context.phase === 'activities') {
      quickReplies = ['Sports', 'Music/Art', 'Clubs', 'Part-time job', 'None'];
    } else if (context.phase === 'optimization') {
      quickReplies = ['Generate timetable', 'Add more activities', 'Adjust study times', 'Looks good'];
    }

    return NextResponse.json({
      response: cleanText,
      quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
      extractedData,
      phase: context.phase
    });

  } catch (error) {
    console.error('Error in AI API:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        message: error instanceof Error ? error.message : 'Unknown error',
        response: "I'm having trouble connecting right now. Let's continue manually. What information would you like to add to your timetable?",
        quickReplies: ['Add classes', 'Set study times', 'Generate timetable', 'Start over']
      },
      { status: 500 }
    );
  }
}