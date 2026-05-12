import { createQuestionSet, isAnswerCorrect } from './questions';
import type { GameSettings, RandomSource, RoundState, ScoreSummary } from './types';

export function createRound(
  settings: GameSettings,
  nowMs = Date.now(),
  random: RandomSource = Math.random
): RoundState {
  return {
    id: cryptoSafeId('round'),
    settings,
    questions: createQuestionSet(settings.operations, settings.questionCount, random),
    currentIndex: 0,
    startedAtMs: nowMs,
    penaltyCount: 0,
    correctCount: 0
  };
}

export function getCurrentQuestion(round: RoundState) {
  return round.questions[round.currentIndex] ?? null;
}

export function getVisibleQuestions(round: RoundState, count = 3) {
  return round.questions.slice(round.currentIndex, round.currentIndex + count);
}

export function applyPenalty(round: RoundState): RoundState {
  return {
    ...round,
    penaltyCount: round.penaltyCount + 1
  };
}

export function submitCorrectAnswer(round: RoundState, answer: number, nowMs = Date.now()): RoundState {
  const question = getCurrentQuestion(round);
  if (!question || !isAnswerCorrect(question, answer)) {
    return round;
  }

  const nextIndex = round.currentIndex + 1;
  const completed = nextIndex >= round.questions.length;

  return {
    ...round,
    currentIndex: nextIndex,
    correctCount: round.correctCount + 1,
    completedAtMs: completed ? nowMs : round.completedAtMs
  };
}

export function isRoundComplete(round: RoundState): boolean {
  return round.currentIndex >= round.questions.length;
}

export function calculateScore(startedAtMs: number, completedAtMs: number, penaltyCount: number): ScoreSummary {
  const elapsedSeconds = roundToTwoDecimals((completedAtMs - startedAtMs) / 1000);
  const penaltySeconds = penaltyCount * 5;
  return {
    elapsedSeconds,
    penaltyCount,
    penaltySeconds,
    score: roundToTwoDecimals(elapsedSeconds + penaltySeconds)
  };
}

export function getRoundTitle(settings: GameSettings): string {
  return `${settings.questionCount}x ${settings.operations.join('')}`;
}

export function cryptoSafeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}