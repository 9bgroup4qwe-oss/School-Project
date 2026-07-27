interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  chapter: string;
}

interface QuizRequest {
  subject: string;
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

export class QuizAIService {
  async generateQuiz(request: QuizRequest): Promise<QuizQuestion[]> {
    try {
      // Call the Python backend API
      const response = await fetch('http://127.0.0.1:8000/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate quiz');
      }

      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate quiz questions. Please try again.');
    }
  }

  private buildQuizPrompt(request: QuizRequest): string {
    const { subject, chapters, difficulty, questionCount } = request;

    const difficultyMap = {
      easy: 'simple, straightforward questions that test basic concepts',
      medium: 'moderately challenging questions that require some thinking',
      hard: 'challenging questions that test deep understanding and application'
    };

    return `Generate ${questionCount} multiple-choice questions for a ${subject} quiz.

    Chapters to cover: ${chapters.join(', ')}
    Difficulty level: ${difficulty} (${difficultyMap[difficulty]})

    Requirements:
    1. Each question must have 4 options (A, B, C, D)
    2. Clearly indicate the correct answer
    3. Include a brief explanation for why the answer is correct
    4. Questions should be appropriate for the specified difficulty level
    5. Distribute questions across all specified chapters

    Format each question as follows:
    [QUESTION]
    {
      "question": "Your question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct",
      "difficulty": "${difficulty}",
      "subject": "${subject}",
      "chapter": "Chapter name"
    }
    [/QUESTION]

    Generate exactly ${questionCount} questions, each wrapped in [QUESTION]...[/QUESTION] tags.`;
  }

  private parseQuizResponse(response: string): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const questionMatches = response.match(/\[QUESTION\]([\s\S]*?)\[\/QUESTION\]/g);

    if (!questionMatches) {
      throw new Error('No questions found in response');
    }

    questionMatches.forEach((match, index) => {
      try {
        // Extract JSON from between the tags
        const jsonStr = match.replace(/\[QUESTION\]/, '').replace(/\[\/QUESTION\]/, '').trim();

        // Find JSON object in the string
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`No JSON found in question ${index + 1}`);
          return;
        }

        const questionData = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!questionData.question || !questionData.options || !Array.isArray(questionData.options)) {
          console.error(`Invalid question format at index ${index}`);
          return;
        }

        const question: QuizQuestion = {
          id: `q_${Date.now()}_${index}`,
          question: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer || 0,
          explanation: questionData.explanation,
          difficulty: questionData.difficulty || 'medium',
          subject: questionData.subject || 'Unknown',
          chapter: questionData.chapter || 'Unknown'
        };

        questions.push(question);
      } catch (error) {
        console.error(`Error parsing question ${index + 1}:`, error);
      }
    });

    if (questions.length === 0) {
      throw new Error('Failed to parse any questions from the response');
    }

    return questions;
  }
}

// Export singleton instance
export const quizAIService = new QuizAIService();