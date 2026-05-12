import { beforeEach, describe, expect, it } from 'vitest';
import { addResult, createDefaultAppData, resetScores, upsertPlayer } from '../src/storage/appStorage';
import type { ResultRecord } from '../src/domain/types';
import type { Operation } from '../src/domain/types';

describe('local app data helpers', () => {
  beforeEach(() => localStorage.clear());

  it('updates player settings without dropping results', () => {
    const data = createDefaultAppData();
    const player = { ...data.players[0], operations: ['+', '*'] satisfies Operation[], questionCount: 100 as const };
    const updated = upsertPlayer(data, player);

    expect(updated.players[0].operations).toEqual(['+', '*']);
    expect(updated.players[0].questionCount).toBe(100);
  });

  it('resets scores for one player only', () => {
    const data = createDefaultAppData();
    const result = makeResult(data.players[0].id);
    const otherResult = makeResult('other-player');
    const withResults = addResult(addResult(data, result), otherResult);
    const reset = resetScores(withResults, data.players[0].id);

    expect(reset.results).toEqual([otherResult]);
  });
});

function makeResult(playerId: string): ResultRecord {
  return {
    id: `result-${playerId}`,
    playerId,
    playerName: 'Player',
    dateIso: new Date(2026, 4, 10).toISOString(),
    title: '20x +',
    operations: ['+'],
    questionCount: 20,
    correctCount: 20,
    elapsedSeconds: 30,
    penaltyCount: 1,
    penaltySeconds: 5,
    score: 35
  };
}