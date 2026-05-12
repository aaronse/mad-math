import { describe, expect, it } from 'vitest';
import { buildQuestionPool, createQuestionSet, isAnswerCorrect } from '../src/domain/questions';
import { calculateScore, createRound, submitCorrectAnswer } from '../src/domain/round';

describe('question generation', () => {
  it('keeps subtraction answers non-negative', () => {
    const questions = buildQuestionPool(['-']);

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every((question) => question.left >= question.right)).toBe(true);
    expect(questions.every((question) => question.answer >= 0)).toBe(true);
  });

  it('keeps division answers whole and avoids zero divisors', () => {
    const questions = buildQuestionPool(['/']);

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every((question) => question.right > 0)).toBe(true);
    expect(questions.every((question) => Number.isInteger(question.answer))).toBe(true);
  });

  it('avoids duplicate prompts while the operation pool can satisfy the round', () => {
    const questions = createQuestionSet(['+'], 20, seededRandom());
    const prompts = new Set(questions.map((question) => question.prompt));

    expect(prompts.size).toBe(20);
  });

  it('still creates full 100-question rounds when a single operation pool is smaller than the round', () => {
    const questions = createQuestionSet(['-'], 100, seededRandom());

    expect(questions).toHaveLength(100);
    expect(questions.every((question) => question.left >= question.right)).toBe(true);
  });

  it('validates answers by operation', () => {
    const [question] = createQuestionSet(['*'], 1, seededRandom());

    expect(isAnswerCorrect(question, question.left * question.right)).toBe(true);
    expect(isAnswerCorrect(question, question.answer + 1)).toBe(false);
  });
});

describe('round scoring', () => {
  it('uses elapsed seconds plus five seconds per penalty', () => {
    expect(calculateScore(1000, 13_340, 2)).toEqual({
      elapsedSeconds: 12.34,
      penaltyCount: 2,
      penaltySeconds: 10,
      score: 22.34
    });
  });

  it('advances after a correct answer', () => {
    const round = createRound(
      { playerId: 'p1', playerName: 'Player 1', operations: ['+'], questionCount: 1 },
      0,
      seededRandom()
    );
    const answer = round.questions[0].answer;
    const nextRound = submitCorrectAnswer(round, answer, 2000);

    expect(nextRound.currentIndex).toBe(1);
    expect(nextRound.correctCount).toBe(1);
    expect(nextRound.completedAtMs).toBe(2000);
  });
});

function seededRandom() {
  let value = 17;
  return () => {
    value = (value * 48271) % 0x7fffffff;
    return value / 0x7fffffff;
  };
}