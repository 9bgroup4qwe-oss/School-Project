export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  chapter: string;
  dbId?: string;
}

export interface QuizRequest {
  subject: string;
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

export class QuizAIService {
  async generateQuiz(request: QuizRequest): Promise<QuizQuestion[]> {
    try {
      // First try Python FastAPI backend
      const pythonBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      try {
        const response = await fetch(`${pythonBackendUrl}/api/quiz/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            return data.questions;
          }
        }
      } catch (e) {
        console.log('Direct Python backend call failed, falling back to Next.js API route');
      }

      // Next.js route fallback
      const nextResponse = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!nextResponse.ok) {
        throw new Error('Failed to generate quiz questions.');
      }

      const data = await nextResponse.json();
      return data.questions || [];
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate quiz questions.');
    }
  }
}

export const quizAIService = new QuizAIService();