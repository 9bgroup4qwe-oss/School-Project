import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory = [], currentTimetable = null, grade = 10, stream = 'General' } = body;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    const isModification = Boolean(currentTimetable);

    // Build the system prompt for the AI Counselor
    let systemPrompt = `You are a supportive, intelligent NCERT & CBSE academic counselor and study timetable assistant at GrowMyIQ.
Your role is to help students plan, optimize, and customize their weekly timetable through natural conversation.

Guidelines:
1. Always be encouraging, practical, and clear.
2. If the student asks to change, add, remove, or generate a schedule (e.g. "I am in Class 12 Commerce", "Add gym at 6pm", "Give more time for Math", "Create board exam timetable"), understand their intent and create or update the weekly schedule for monday, tuesday, wednesday, thursday, friday, saturday, sunday.
3. Keep your conversational response friendly (1-3 sentences).
4. Whenever you create or modify a schedule, ALWAYS append the complete updated schedule at the very end wrapped inside [TIMETABLE] ... [/TIMETABLE] JSON tags like this:

[TIMETABLE]
{
  "monday": [
    {"id": "m1", "time": "06:30 - 07:30", "activity": "Morning Routine", "type": "personal"},
    {"id": "m2", "time": "07:30 - 08:15", "activity": "Breakfast", "type": "meal"},
    {"id": "m3", "time": "08:30 - 14:00", "activity": "School / Coaching", "type": "class"},
    {"id": "m4", "time": "15:30 - 17:00", "activity": "Subject Study", "type": "study"},
    {"id": "m5", "time": "17:30 - 19:00", "activity": "Concept Revision", "type": "study"},
    {"id": "m6", "time": "19:00 - 19:45", "activity": "Practice Quiz", "type": "quiz"},
    {"id": "m7", "time": "20:00 - 21:00", "activity": "Dinner", "type": "meal"},
    {"id": "m8", "time": "21:00 - 22:30", "activity": "Review & Bedtime", "type": "study"}
  ],
  "tuesday": [...],
  "wednesday": [...],
  "thursday": [...],
  "friday": [...],
  "saturday": [...],
  "sunday": [...]
}
[/TIMETABLE]

Slot types must be: 'class', 'study', 'quiz', 'meal', 'personal'.`;

    if (currentTimetable) {
      systemPrompt += `\n\nCURRENT TIMETABLE IN EFFECT:\n${JSON.stringify(currentTimetable, null, 2)}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      { role: 'user', content: message || 'Create a balanced study timetable for me.' }
    ];

    if (apiKey) {
      const orModels = [
        'google/gemma-4-31b-it:free',
        'minimax/minimax-m2.7:free',
        'nvidia/nemotron-3.5-lightning:free'
      ];

      for (const model of orModels) {
        try {
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'GrowMyIQ'
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: 0.6
            }),
            signal: AbortSignal.timeout(6000)
          });

          if (orRes.ok) {
            const orData = await orRes.json();
            const rawContent = orData.choices?.[0]?.message?.content || '';
            if (rawContent) {
              let cleanText = rawContent.trim();
              let updatedSchedule: any = null;

              if (cleanText.includes('[TIMETABLE]')) {
                const parts = cleanText.split('[TIMETABLE]');
                cleanText = parts[0].trim();
                const jsonPart = parts[1].split('[/TIMETABLE]')[0].trim();
                try {
                  updatedSchedule = JSON.parse(jsonPart);
                } catch (pe) {
                  console.warn('Failed parsing timetable json from AI response:', pe);
                }
              }

              // Dynamic quick replies based on context
              const quickReplies = [
                'Add 1 hour evening revision',
                'Focus more on weak subjects',
                'Add sports & workout at 5 PM',
                'Shift study sessions to early morning'
              ];

              return NextResponse.json({
                response: cleanText || "I have updated your timetable based on your goals!",
                schedule: updatedSchedule,
                quickReplies,
                source: `openrouter-${model}`
              });
            }
          }
        } catch (mErr) {
          console.warn(`Model ${model} error in timetable chat:`, mErr);
        }
      }
    }

    // Smart fallback counselor response if offline
    const subjects =
      stream === 'Commerce'
        ? ['Accountancy', 'Business Studies', 'Economics', 'Mathematics']
        : stream === 'Humanities'
        ? ['History', 'Political Science', 'Geography', 'Psychology']
        : stream === 'Science'
        ? ['Physics', 'Chemistry', 'Mathematics', 'Biology']
        : ['Mathematics', 'Science', 'Social Science', 'English'];

    const createFallbackDay = (name: string, isWeekend: boolean, s1: string, s2: string) => {
      if (isWeekend) {
        return [
          { id: `${name}-1`, time: '07:30 - 08:30', activity: 'Morning Exercise & Breakfast', type: 'personal' },
          { id: `${name}-2`, time: '09:00 - 11:00', activity: `${s1} — Deep Problem Solving`, type: 'study' },
          { id: `${name}-3`, time: '11:15 - 12:30', activity: `${s1} — NCERT Practice Quiz`, type: 'quiz' },
          { id: `${name}-4`, time: '13:00 - 14:00', activity: 'Lunch Break', type: 'meal' },
          { id: `${name}-5`, time: '15:00 - 17:00', activity: `${s2} — Chapter Review & Notes`, type: 'study' },
          { id: `${name}-6`, time: '17:30 - 19:00', activity: 'Outdoor Sports & Free Time', type: 'personal' },
          { id: `${name}-7`, time: '20:30 - 22:30', activity: 'Weekly Revision & Light Reading', type: 'study' }
        ];
      }

      return [
        { id: `${name}-1`, time: '06:30 - 07:30', activity: 'Morning Routine & Wake-up', type: 'personal' },
        { id: `${name}-2`, time: '07:30 - 08:15', activity: 'Breakfast', type: 'meal' },
        { id: `${name}-3`, time: '08:30 - 14:00', activity: `School / Classes (${s1} & ${s2})`, type: 'class' },
        { id: `${name}-4`, time: '14:00 - 15:00', activity: 'Lunch & Power Rest', type: 'meal' },
        { id: `${name}-5`, time: '15:30 - 17:00', activity: `${s1} — Self Study & Notes`, type: 'study' },
        { id: `${name}-6`, time: '17:00 - 17:30', activity: 'Evening Snack Break', type: 'meal' },
        { id: `${name}-7`, time: '17:30 - 19:00', activity: `${s2} — Problem Solving`, type: 'study' },
        { id: `${name}-8`, time: '19:00 - 19:45', activity: `${s1} — 10-Q Practice Quiz`, type: 'quiz' },
        { id: `${name}-9`, time: '20:00 - 21:00', activity: 'Dinner & Family Time', type: 'meal' },
        { id: `${name}-10`, time: '21:00 - 22:30', activity: 'Day Review & Bedtime', type: 'study' }
      ];
    };

    const smartSchedule = {
      monday: createFallbackDay('mon', false, subjects[0], subjects[1]),
      tuesday: createFallbackDay('tue', false, subjects[1], subjects[2]),
      wednesday: createFallbackDay('wed', false, subjects[2], subjects[3 % subjects.length]),
      thursday: createFallbackDay('thu', false, subjects[0], subjects[3 % subjects.length]),
      friday: createFallbackDay('fri', false, subjects[1], subjects[0]),
      saturday: createFallbackDay('sat', true, subjects[2], subjects[0]),
      sunday: createFallbackDay('sun', true, subjects[3 % subjects.length], subjects[1])
    };

    return NextResponse.json({
      response: `I have updated your schedule tailored for Class ${grade} (${stream} stream) with balanced study intervals, school hours, and revision quizzes!`,
      schedule: smartSchedule,
      quickReplies: [
        'Add 1 hour evening revision',
        'Add sports at 5 PM',
        'Make morning study earlier',
        'Focus more on weak topics'
      ],
      source: 'counselor-engine'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to process chat message', message: err.message },
      { status: 500 }
    );
  }
}