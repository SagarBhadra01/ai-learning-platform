// Shared TypeScript interfaces for the application
export type View = 'dashboard' | 'generate' | 'learn' | 'profile' | 'bookmarks';

export interface ChatMessage { 
  role: 'user' | 'model'; 
  parts: { text: string }[]; 
}

export interface User { 
  id: string;
  name: string; 
  xp: number; 
  level: number; 
  xpToNextLevel?: number;
  streak: number; 
  avatarUrl: string; 
  lastCompletedDate: string | null; 
  quizHistory: QuizResult[]; 
}

export interface Lesson { 
  title: string; 
  content: string; 
  xp: number; 
  completed: boolean; 
  quiz?: Quiz; 
}

export interface Chapter { 
  title: string; 
  lessons: Lesson[]; 
}

export interface Course { 
  id: string; 
  _id?: string; 
  title: string; 
  description: string; 
  level: 'Beginner' | 'Intermediate' | 'Advanced'; 
  imageUrl: string; 
  chapters: Chapter[]; 
}

export interface QuizQuestion { 
  question: string; 
  options: string[]; 
  correctAnswer: string; 
}

export interface Quiz { 
  title: string; 
  questions: QuizQuestion[]; 
}

export interface QuizResult { 
  courseId: string; 
  quizTitle: string; 
  score: number; 
  correct: number; 
  total: number; 
  date: string; 
}

export interface QuizProgress { 
  courseId: string; 
  chapterIndex: number; 
  lessonIndex: number; 
  currentQuestionIndex: number; 
  answers: { [key: number]: string }; 
}

export interface GeminiResponse { 
  candidates: [{ content: { parts: [{ text: string; }]; }; }]; 
}
