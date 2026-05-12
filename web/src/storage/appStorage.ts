import { cryptoSafeId } from '../domain/round';
import type { GameSettings, Operation, ResultRecord, RoundSize } from '../domain/types';

export interface PlayerProfile {
  id: string;
  name: string;
  operations: Operation[];
  questionCount: RoundSize;
}

export interface AppData {
  version: 1;
  currentPlayerId: string;
  players: PlayerProfile[];
  results: ResultRecord[];
}

const storageKey = 'mad-math:v1';

export const defaultPlayers: PlayerProfile[] = [
  { id: 'player-1', name: 'Player 1', operations: ['+'], questionCount: 20 }
];

export function createDefaultAppData(): AppData {
  return {
    version: 1,
    currentPlayerId: defaultPlayers[0].id,
    players: [...defaultPlayers],
    results: []
  };
}

export function loadAppData(): AppData {
  if (!canUseLocalStorage()) {
    return createDefaultAppData();
  }

  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return createDefaultAppData();
  }

  try {
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.version === 1 && parsed.players.length > 0) {
      return parsed;
    }
  } catch {
    localStorage.removeItem(storageKey);
  }

  return createDefaultAppData();
}

export function saveAppData(data: AppData): void {
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function upsertPlayer(data: AppData, player: PlayerProfile): AppData {
  const existingIndex = data.players.findIndex((item) => item.id === player.id);
  const players = [...data.players];

  if (existingIndex >= 0) {
    players[existingIndex] = player;
  } else {
    players.push(player);
  }

  return {
    ...data,
    currentPlayerId: player.id,
    players
  };
}

export function createPlayer(name: string): PlayerProfile {
  return {
    id: cryptoSafeId('player'),
    name: name.trim(),
    operations: ['+'],
    questionCount: 20
  };
}

export function addResult(data: AppData, result: ResultRecord): AppData {
  return {
    ...data,
    results: [...data.results, result]
  };
}

export function resetScores(data: AppData, playerId: string): AppData {
  return {
    ...data,
    results: data.results.filter((result) => result.playerId !== playerId)
  };
}

export function playerToSettings(player: PlayerProfile): GameSettings {
  return {
    playerId: player.id,
    playerName: player.name,
    operations: player.operations,
    questionCount: player.questionCount
  };
}

function canUseLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}