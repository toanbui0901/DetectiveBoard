export type DifficultyLevel = 'Dễ' | 'Trung Bình' | 'Hóc Búa' | 'Kỳ Tài';

export type CaseCategory =
  | 'Án Mạng Bí Ẩn'
  | 'Trộm Cắp & Báu Vật'
  | 'Tống Tiền & Âm Mưu'
  | 'Vụ Mất Tích'
  | 'Bí Mật Đô Thị';

export type LeadCategory =
  | 'Hiện Trường'
  | 'Nghi Phạm'
  | 'Nhân Chứng'
  | 'Pháp Y & Cơ Quan'
  | 'Địa Điểm Đô Thị';

export interface Lead {
  id: string;
  name: string;
  category: LeadCategory;
  address: string;
  district: string;
  description: string;
  clueFound: string | null;
  isCrucial?: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface CaseQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
  points: number;
}

export interface NewspaperClipping {
  title: string;
  date: string;
  content: string;
  source: string;
}

export interface HolmesSolution {
  summary: string;
  culprit: string;
  motive: string;
  method: string;
  holmesCritique: string;
}

export interface CaseReward {
  headline: string;
  newspaperSpecial: {
    paperName: string;
    issueDate: string;
    headline: string;
    subheadline: string;
    article: string;
  };
  completeStory: {
    title: string;
    author: string;
    chapters: {
      chapterTitle: string;
      content: string;
    }[];
    epilogue: string;
  };
}

export interface DetectiveCase {
  id: string;
  number: number;
  title: string;
  originalLore: string;
  collection?: string; // Tên bộ board game nguồn
  date: string;
  difficulty: DifficultyLevel;
  category: CaseCategory;
  clueQuota: number; // Hạn mức manh mối (8-15)
  holmesCluesUsed: number; // Holmes giải trong bao nhiêu manh mối
  synopsis: string;
  initialBriefing: string;
  victim: string;
  crimeScene: string;
  newspaperClipping: NewspaperClipping;
  leads: Lead[];
  questions: CaseQuestion[];
  holmesSolution: HolmesSolution;
  rewardStory?: CaseReward;
  isCustom?: boolean;
  isAIGenerated?: boolean;
  createdAt?: string;
}


export interface PlayerInvestigationState {
  caseId: string;
  visitedLeadIds: string[];
  notes: string;
  answers: Record<string, string>; // questionId -> optionId
  isSubmitted: boolean;
  score?: number;
  rank?: string;
  rankBadge?: string;
  feedback?: string;
  solvedAt?: string;
}

export interface ScoreResult {
  rawQuestionScore: number;
  maxQuestionScore: number;
  penaltyOrBonus: number;
  totalScore: number;
  cluesUsed: number;
  clueQuota: number;
  holmesBenchmark: number;
  rank: string;
  rankTitle: string;
  rankBadge: string;
  commentary: string;
  detailedAnswers: {
    questionId: string;
    question: string;
    selectedOptionText: string;
    isCorrect: boolean;
    explanation: string;
    pointsAwarded: number;
  }[];
}

export type UserRole = 'detective' | 'investigator' | 'admin' | 'superadmin';

export interface UserToken {
  id: string;
  userId: string;
  tokenKey: string;
  name: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'revoked' | 'expired';
  lastUsedAt?: string;
  usageCount: number;
  quotaLimit: number;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  status: 'active' | 'suspended';
  permissions: string[];
  tokenBalance: number;
  tokens: UserToken[];
  casesSolved: number;
  totalScore: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LeaderboardUser {
  id: string;
  rankPosition: number;
  username: string;
  fullName: string;
  roleTitle: string;
  casesSolved: number;
  totalScore: number;
  averageScore: number;
  clueEfficiency: number; // Tỷ lệ manh mối tiết kiệm so với hạn mức (%)
  rankBadge: string;
  rankTitle: string;
  lastActive: string;
}

export const DIFFICULTY_ORDER: Record<DifficultyLevel, number> = {
  'Dễ': 1,
  'Trung Bình': 2,
  'Hóc Búa': 3,
  'Kỳ Tài': 4,
};

