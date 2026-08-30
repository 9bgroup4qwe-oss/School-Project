import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { portionText = '', grade = 10, stream = 'General', examDate = '' } = body;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

    const prompt = `You are an expert CBSE/NCERT academic planner.
A student in Class ${grade} (${stream} stream) provided the following exam portion / syllabus sheet:
"""
${portionText}
"""
Target Exam Date: ${examDate || 'Upcoming Exams'}

Task:
1. Extract the specific subjects and chapters from the portion text.
2. Generate an optimized 7-day revision timetable (monday through sunday) distributing study sessions and quizzes specifically for these portion chapters.
3. Every study and quiz slot MUST mention the specific chapter/subject from the portion.

Format:
Return ONLY a valid JSON object matching this structure (no markdown, no backticks):
{
  "extractedChapters": ["Chapter 1 Name", "Chapter 2 Name"],
  "schedule": {
    "monday": [
      {"id": "p_mon_1", "time": "06:30 - 07:30", "activity": "Morning Routine & Wake-up", "type": "personal"},
      {"id": "p_mon_2", "time": "08:30 - 14:00", "activity": "School / Coaching", "type": "class"},
      {"id": "p_mon_3", "time": "15:30 - 17:00", "activity": "Subject 1 (Chapter Name) — Portion Deep Revision", "type": "study"},
      {"id": "p_mon_4", "time": "17:30 - 19:00", "activity": "Subject 2 (Chapter Name) — Notes & Problems", "type": "study"},
      {"id": "p_mon_5", "time": "19:00 - 19:45", "activity": "Subject 1 — NCERT Chapter Quiz", "type": "quiz"},
      {"id": "p_mon_6", "time": "21:00 - 22:30", "activity": "Portion Formula Review & Bedtime", "type": "study"}
    ],
    "tuesday": [...],
    "wednesday": [...],
    "thursday": [...],
    "friday": [...],
    "saturday": [...],
    "sunday": [...]
  }
}`;

    if (apiKey) {
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
            model: 'google/gemma-4-31b-it:free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4
          }),
          signal: AbortSignal.timeout(6000)
        });

        if (orRes.ok) {
          const orData = await orRes.json();
          const content = orData.choices?.[0]?.message?.content || '';
          let cleaned = content.trim();
          if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
          else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
          if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
          cleaned = cleaned.trim();

          const parsed = JSON.parse(cleaned);
          if (parsed && parsed.schedule && parsed.schedule.monday) {
            return NextResponse.json({ success: true, ...parsed, source: 'gemma-ai' });
          }
        }
      } catch (aiErr) {
        console.warn('OpenRouter parse-portion fallback:', aiErr);
      }
    }

    // Smart fallback extraction
    const lines = portionText.split('\n').map(l => l.trim()).filter(Boolean);
    const chapters = lines.length > 0 ? lines : ['Chapter 1: Foundations', 'Chapter 2: Core Concepts', 'Chapter 3: Advanced Applications'];

    const createPortionDay = (name: string, isWeekend: boolean, ch1: string, ch2: string) => {
      if (isWeekend) {
        return [
          { id: `${name}_1`, time: '07:30 - 08:30', activity: 'Morning Walk & Refresh', type: 'personal' },
          { id: `${name}_2`, time: '09:00 - 11:30', activity: `${ch1} — Portion Mastery & Solved Examples`, type: 'study' },
          { id: `${name}_3`, time: '11:45 - 12:45', activity: `${ch1} — NCERT Practice Quiz`, type: 'quiz' },
          { id: `${name}_4`, time: '13:00 - 14:00', activity: 'Lunch & Break', type: 'meal' },
          { id: `${name}_5`, time: '15:00 - 17:30', activity: `${ch2} — Intensive Chapter Revision`, type: 'study' },
          { id: `${name}_6`, time: '18:00 - 19:30', activity: 'Outdoor Sports / Personal Time', type: 'personal' },
          { id: `${name}_7`, time: '20:30 - 22:30', activity: 'Portion Summary Notes & Review', type: 'study' }
        ];
      }

      return [
        { id: `${name}_1`, time: '06:30 - 07:30', activity: 'Morning Routine & Refresh', type: 'personal' },
        { id: `${name}_2`, time: '08:30 - 14:00', activity: 'School Classes', type: 'class' },
        { id: `${name}_3`, time: '15:30 - 17:00', activity: `${ch1} — Portion Self-Study & Notes`, type: 'study' },
        { id: `${name}_4`, time: '17:00 - 17:30', activity: 'Evening Snack Break', type: 'meal' },
        { id: `${name}_5`, time: '17:30 - 19:00', activity: `${ch2} — Concept Mastery & Problems`, type: 'study' },
        { id: `${name}_6`, time: '19:00 - 19:45', activity: `${ch1} — Chapter Practice Quiz (10 Qs)`, type: 'quiz' },
        { id: `${name}_7`, time: '20:00 - 21:00', activity: 'Dinner & Family Time', type: 'meal' },
        { id: `${name}_8`, time: '21:00 - 22:30', activity: 'Formula Revision & Bedtime', type: 'study' }
      ];
    };

    const scheduled = {
      monday: createPortionDay('mon', false, chapters[0 % chapters.length], chapters[1 % chapters.length]),
      tuesday: createPortionDay('tue', false, chapters[1 % chapters.length], chapters[2 % chapters.length]),
      wednesday: createPortionDay('wed', false, chapters[2 % chapters.length], chapters[0 % chapters.length]),
      thursday: createPortionDay('thu', false, chapters[0 % chapters.length], chapters[2 % chapters.length]),
      friday: createPortionDay('fri', false, chapters[1 % chapters.length], chapters[0 % chapters.length]),
      saturday: createPortionDay('sat', true, chapters[2 % chapters.length], chapters[1 % chapters.length]),
      sunday: createPortionDay('sun', true, chapters[0 % chapters.length], chapters[2 % chapters.length])
    };

    return NextResponse.json({
      success: true,
      extractedChapters: chapters,
      schedule: scheduled,
      source: 'smart-portion-scheduler'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to process portion sheet', message: err.message },
      { status: 500 }
    );
  }
}
