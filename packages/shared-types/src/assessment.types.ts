import { AssessmentDifficulty, QuestionType } from './enums';

export interface AssessmentOption {
  text: string;
  isCorrect: boolean;
}

export interface AssessmentQuestion {
  questionText: string;
  questionType: QuestionType;
  options: AssessmentOption[];
  explanation?: string;
  points: number;
  codeSnippet?: string;
}

export interface IAssessment {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  skill: string;
  difficulty: AssessmentDifficulty;
  duration: number;
  passingScore: number;
  questions: AssessmentQuestion[];
  totalPoints: number;
  isActive: boolean;
  attemptCount: number;
  avgScore: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssessmentAttempt {
  _id: string;
  user: string;
  assessment: string;
  answers: Array<{
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
    pointsEarned: number;
  }>;
  score: number;
  pointsEarned: number;
  totalPoints: number;
  passed: boolean;
  timeTaken: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
