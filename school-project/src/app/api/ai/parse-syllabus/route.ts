import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

interface ParsedSyllabus {
  subjects: Array<{
    name: string;
    chapters: Array<{
      name: string;
      topics: string[];
      difficulty: 'easy' | 'medium' | 'hard';
      estimatedHours: number;
      priority: 'low' | 'medium' | 'high';
    }>;
    totalChapters: number;
    totalHours: number;
  }>;
  examDate?: string;
  daysUntilExam?: number;
  totalSubjects: number;
  totalHours: number;
  recommendations: string[];
}

async function getMockSyllabusData() {
  // Return mock data when API is not configured
  const mockData: ParsedSyllabus = {
    subjects: [
      {
        name: 'Mathematics',
        chapters: [
          {
            name: 'Sets and Relations',
            topics: ['Sets', 'Relations and Functions', 'Types of Relations'],
            difficulty: 'medium',
            estimatedHours: 8,
            priority: 'high'
          },
          {
            name: 'Functions',
            topics: ['Domain and Range', 'Types of Functions', 'Composition of Functions'],
            difficulty: 'medium',
            estimatedHours: 10,
            priority: 'high'
          },
          {
            name: 'Trigonometric Functions',
            topics: ['Angles and Arc Measures', 'Trigonometric Identities', 'Trigonometric Equations'],
            difficulty: 'hard',
            estimatedHours: 12,
            priority: 'high'
          }
        ],
        totalChapters: 3,
        totalHours: 30
      },
      {
        name: 'Physics',
        chapters: [
          {
            name: 'Physical World',
            topics: ['Introduction to Physics', 'Scope and Excitement of Physics'],
            difficulty: 'easy',
            estimatedHours: 4,
            priority: 'low'
          },
          {
            name: 'Units and Measurements',
            topics: ['SI Units', 'Dimensional Analysis', 'Errors in Measurement'],
            difficulty: 'medium',
            estimatedHours: 8,
            priority: 'medium'
          },
          {
            name: 'Motion in a Straight Line',
            topics: ['Kinematics Concepts', 'Graphical Analysis', 'Equations of Motion'],
            difficulty: 'medium',
            estimatedHours: 10,
            priority: 'high'
          }
        ],
        totalChapters: 3,
        totalHours: 22
      },
      {
        name: 'Chemistry',
        chapters: [
          {
            name: 'Some Basic Concepts of Chemistry',
            topics: ['Mole Concept', 'Stoichiometry', 'Atomic and Molecular Masses'],
            difficulty: 'medium',
            estimatedHours: 9,
            priority: 'high'
          },
          {
            name: 'Structure of Atom',
            topics: ["Bohr's Model", 'Quantum Numbers', 'Electronic Configuration'],
            difficulty: 'hard',
            estimatedHours: 11,
            priority: 'high'
          }
        ],
        totalChapters: 2,
        totalHours: 20
      }
    ],
    examDate: '2025-03-15',
    daysUntilExam: 87,
    totalSubjects: 3,
    totalHours: 72,
    recommendations: [
      'Focus on Mathematics as it has the highest workload',
      'Start with difficult topics like Trigonometry and Atomic Structure',
      'Practice Physics problems daily for better understanding',
      'Create summary notes for Chemistry concepts',
      'Take regular mock tests to track progress'
    ]
  };

  return NextResponse.json({
    success: true,
    data: mockData,
    message: 'Using mock syllabus data. Configure GEMINI_API_KEY for AI-powered analysis.'
  });
}

export async function POST(request: NextRequest) {
  try {
    const { text, fileName } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!genAI) {
      console.warn('GEMINI_API_KEY not configured, using mock data');
      // Return mock data if API key is not configured
      return await getMockSyllabusData();
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const systemPrompt = `You are an expert academic planner. Analyze the given portion sheet/syllabus text and extract structured information.

Your task:
1. Identify all subjects and their chapters
2. For each chapter, identify main topics
3. Estimate difficulty level (easy/medium/hard) based on topic complexity
4. Estimate study hours needed for each chapter
5. Set priority based on exam weightage and difficulty
6. Extract exam date if mentioned
7. Provide study recommendations

Return your response in this exact JSON format:
{
  "subjects": [
    {
      "name": "Subject Name",
      "chapters": [
        {
          "name": "Chapter Name",
          "topics": ["Topic 1", "Topic 2", "Topic 3"],
          "difficulty": "easy|medium|hard",
          "estimatedHours": number,
          "priority": "low|medium|high"
        }
      ],
      "totalChapters": number,
      "totalHours": number
    }
  ],
  "examDate": "YYYY-MM-DD" or null,
  "daysUntilExam": number or null,
  "totalSubjects": number,
  "totalHours": number,
  "recommendations": [
    "Study recommendation 1",
    "Study recommendation 2"
  ]
}

Important notes:
- Estimate study hours realistically (easy: 2-4h, medium: 5-8h, hard: 9-12h per chapter)
- High priority for difficult topics or those with more weightage
- Include ALL chapters found in the text
- If exam date is not found, set it to null
- Days until exam should be calculated from today's date if exam date is found
- Provide actionable study recommendations

Now analyze this syllabus text:`;

    const fullPrompt = `${systemPrompt}

${text}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    let response = result.response.text();

    // Clean up the response to extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }

    let parsedData: ParsedSyllabus;
    try {
      parsedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse AI response');
    }

    // Validate and clean the parsed data
    if (!parsedData.subjects || !Array.isArray(parsedData.subjects)) {
      throw new Error('Invalid syllabus structure');
    }

    // Calculate totals if not provided
    parsedData.totalSubjects = parsedData.subjects.length;
    parsedData.totalHours = parsedData.subjects.reduce((acc, subject) => {
      return acc + (subject.totalHours || 0);
    }, 0);

    // Ensure each subject has proper structure
    parsedData.subjects = parsedData.subjects.map(subject => {
      if (!subject.chapters || !Array.isArray(subject.chapters)) {
        return {
          ...subject,
          chapters: [],
          totalChapters: 0,
          totalHours: 0
        };
      }

      return {
        ...subject,
        totalChapters: subject.chapters.length,
        totalHours: subject.chapters.reduce((acc, chapter) => {
          return acc + (chapter.estimatedHours || 0);
        }, 0)
      };
    });

    // Calculate days until exam if exam date is provided
    if (parsedData.examDate) {
      const examDate = new Date(parsedData.examDate);
      const today = new Date();
      const diffTime = examDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      parsedData.daysUntilExam = diffDays > 0 ? diffDays : null;
    }

    // Add default recommendations if none provided
    if (!parsedData.recommendations || parsedData.recommendations.length === 0) {
      parsedData.recommendations = [
        'Start with difficult subjects to get more practice',
        'Regular revision is key to retaining information',
        'Take breaks between study sessions for better retention',
        'Practice previous year question papers',
        'Form study groups for difficult topics'
      ];
    }

    return NextResponse.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Syllabus parsing error:', error);

    // Return a default structure if parsing fails
    const defaultData: ParsedSyllabus = {
      subjects: [
        {
          name: 'General Studies',
          chapters: [
            {
              name: 'Study Plan',
              topics: ['Create a schedule', 'Set goals', 'Track progress'],
              difficulty: 'medium',
              estimatedHours: 5,
              priority: 'high'
            }
          ],
          totalChapters: 1,
          totalHours: 5
        }
      ],
      examDate: null,
      daysUntilExam: null,
      totalSubjects: 1,
      totalHours: 5,
      recommendations: [
        'Please upload a clear portion sheet for better analysis',
        'Ensure the text is readable and properly formatted',
        'Include exam dates and chapter weightages if available'
      ]
    };

    return NextResponse.json({
      success: true,
      data: defaultData,
      warning: 'Failed to parse syllabus accurately. Using default structure.'
    });
  }
}