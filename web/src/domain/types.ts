export const OPERATIONS = ['+', '-', '*', '/'] as const;
export type Operation = (typeof OPERATIONS)[number];

export const ROUND_SIZES = [1, 20, 100] as const;
export type RoundSize = (typeof ROUND_SIZES)[number];

export interface Question {
  id: string;
  left: number;
  right: number;
  operation: Operation;
  displayOperator: string;
  prompt: string;
  answer: number;
}

export interface GameSettings {
  playerId: string;
  playerName: string;
  operations: Operation[];
  questionCount: RoundSize;
}

export interface RoundState {
  id: string;
  settings: GameSettings;
  questions: Question[];
  currentIndex: number;
  startedAtMs: number;
  completedAtMs?: number;
  penaltyCount: number;
  correctCount: number;
}

export interface ScoreSummary {
  elapsedSeconds: number;
  penaltyCount: number;
  penaltySeconds: number;
  score: number;
}

export interface ResultRecord extends ScoreSummary {
  id: string;
  playerId: string;
  playerName: string;
  dateIso: string;
  title: string;
  operations: Operation[];
  questionCount: RoundSize;
  correctCount: number;
}

export type RandomSource = () => number;