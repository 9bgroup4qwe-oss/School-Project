import { v4 as uuidv4 } from 'uuid';

export interface QuizSession {
  id: string;
  userId: string;
  subject: string;
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  startedAt: Date;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuizQuestionDB {
  id: string;
  sessionId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subject: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionIndex: number;
}

export interface QuizAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeTaken?: number;
  answeredAt: Date;
}

export class QuizSessionService {
  private static instance: QuizSessionService;
  private currentSession: QuizSession | null = null;
  private sessionStartTime: number = 0;
  private questionStartTime: number = 0;
  private answerQueue: Array<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    timeTaken: number;
  }> = [];

  public static getInstance(): QuizSessionService {
    if (!QuizSessionService.instance) {
      QuizSessionService.instance = new QuizSessionService();
    }
    return QuizSessionService.instance;
  }

  async createSession(quizData: {
    subject: string;
    chapters: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
  }): Promise<QuizSession> {
    try {
      const response = await fetch('/api/quiz/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData)
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz session');
      }

      const { session } = await response.json();

      this.currentSession = {
        ...session,
        startedAt: new Date(session.started_at)
      };
      this.sessionStartTime = Date.now();
      this.answerQueue = [];

      return this.currentSession;
    } catch (error) {
      console.error('Error creating quiz session:', error);
      throw error;
    }
  }

  getCurrentSession(): QuizSession | null {
    return this.currentSession;
  }

  async saveQuestions(questions: any[]): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      const response = await fetch('/api/quiz/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.currentSession.id,
          questions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save questions');
      }

      const { questions: savedQuestions } = await response.json();

      // Update questions with their database IDs
      questions.forEach((q, index) => {
        q.dbId = savedQuestions[index]?.id;
      });

    } catch (error) {
      console.error('Error saving questions:', error);
      throw error;
    }
  }

  startQuestionTimer(): void {
    this.questionStartTime = Date.now();
  }

  async saveAnswer(questionId: string, selectedOption: number, isCorrect: boolean): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const timeTaken = Math.floor((Date.now() - this.questionStartTime) / 1000);

    try {
      const response = await fetch('/api/quiz/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.currentSession.id,
          questionId,
          selectedOption,
          isCorrect,
          timeTaken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save answer');
      }

    } catch (error) {
      console.error('Error saving answer:', error);
      // Queue the answer to retry later
      this.answerQueue.push({
        questionId,
        selectedOption,
        isCorrect,
        timeTaken
      });
    }
  }

  async completeSession(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const timeTaken = Math.floor((Date.now() - this.sessionStartTime) / 1000);

    try {
      // Retry any queued answers
      for (const answer of this.answerQueue) {
        await fetch('/api/quiz/answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: this.currentSession.id,
            ...answer
          })
        });
      }

      // Update session status
      const response = await fetch(`/api/quiz/session/${this.currentSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          timeTaken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      this.currentSession = null;
      this.answerQueue = [];

    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  }

  async abandonSession(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    try {
      await fetch(`/api/quiz/session/${this.currentSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'abandoned'
        })
      });

      this.currentSession = null;
      this.answerQueue = [];

    } catch (error) {
      console.error('Error abandoning session:', error);
    }
  }
}

export const quizSessionService = QuizSessionService.getInstance();