import { useMemo, useState } from 'react';
import type { PlayerProfile } from '../storage/appStorage';
import { createPlayer, playerToSettings, upsertPlayer } from '../storage/appStorage';
import { OPERATIONS, ROUND_SIZES } from '../domain/types';
import type { AppData } from '../storage/appStorage';
import type { GameSettings, Operation, RoundSize } from '../domain/types';

interface SetupScreenProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
  onStart: (settings: GameSettings) => void;
}

const operationLabels: Record<Operation, string> = {
  '+': 'Add',
  '-': 'Subtract',
  '*': 'Multiply',
  '/': 'Divide'
};

export function SetupScreen({ data, onDataChange, onStart }: SetupScreenProps) {
  const currentPlayer = useMemo(
    () => data.players.find((player) => player.id === data.currentPlayerId) ?? data.players[0],
    [data.currentPlayerId, data.players]
  );
  const [newPlayerName, setNewPlayerName] = useState('');
  const recentResults = data.results
    .filter((result) => result.playerId === currentPlayer.id)
    .slice(-5)
    .reverse();

  function updatePlayer(update: Partial<PlayerProfile>) {
    onDataChange(upsertPlayer(data, { ...currentPlayer, ...update }));
  }

  function toggleOperation(operation: Operation) {
    const hasOperation = currentPlayer.operations.includes(operation);
    const operations = hasOperation
      ? currentPlayer.operations.filter((item) => item !== operation)
      : [...currentPlayer.operations, operation];

    updatePlayer({ operations });
  }

  function addPlayer() {
    const name = newPlayerName.trim();
    if (!name) {
      return;
    }

    const player = createPlayer(name);
    onDataChange(upsertPlayer(data, player));
    setNewPlayerName('');
  }

  function startGame() {
    if (currentPlayer.operations.length === 0) {
      return;
    }
    onStart(playerToSettings(currentPlayer));
  }

  return (
    <main className="setup-screen" aria-labelledby="setup-title">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Local-first math practice</p>
          <h1 id="setup-title">Mad Math</h1>
          <p className="hero-copy">Fast rounds, friendly feedback, and history that stays on this device.</p>
        </div>
        <button className="primary-action" type="button" onClick={startGame} disabled={currentPlayer.operations.length === 0}>
          Start {currentPlayer.questionCount} questions
        </button>
      </section>

      <section className="setup-grid" aria-label="Game setup">
        <div className="panel setup-card">
          <h2>Player</h2>
          <label className="field-label" htmlFor="player-select">Current player</label>
          <select
            id="player-select"
            value={currentPlayer.id}
            onChange={(event) => onDataChange({ ...data, currentPlayerId: event.target.value })}
          >
            {data.players.map((player) => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
          <div className="inline-form">
            <input
              aria-label="New player name"
              value={newPlayerName}
              onChange={(event) => setNewPlayerName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addPlayer();
              }}
              placeholder="New player"
            />
            <button type="button" onClick={addPlayer}>Add</button>
          </div>
        </div>

        <div className="panel setup-card">
          <h2>Operations</h2>
          <div className="segmented-grid" role="group" aria-label="Operations">
            {OPERATIONS.map((operation) => {
              const selected = currentPlayer.operations.includes(operation);
              return (
                <button
                  key={operation}
                  type="button"
                  className={selected ? 'segment selected' : 'segment'}
                  aria-label={operationLabels[operation]}
                  aria-pressed={selected}
                  onClick={() => toggleOperation(operation)}
                >
                  <span className="operator-symbol">{operation === '*' ? 'x' : operation}</span>
                  <span className="segment-label">{operationLabels[operation]}</span>
                </button>
              );
            })}
          </div>
          {currentPlayer.operations.length === 0 && <p className="validation-text">Pick at least one operation.</p>}
        </div>

        <div className="panel setup-card">
          <h2>Round</h2>
          <div className="round-options" role="group" aria-label="Question count">
            {ROUND_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={currentPlayer.questionCount === size ? 'round-option selected' : 'round-option'}
                aria-label={`${size} ${size === 1 ? 'question' : 'questions'}`}
                aria-pressed={currentPlayer.questionCount === size}
                onClick={() => updatePlayer({ questionCount: size as RoundSize })}
              >
                <span>{size}</span>
                <small className="round-option-label">{size === 1 ? 'question' : 'questions'}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="panel setup-card history-card">
          <h2>Recent Scores</h2>
          {recentResults.length === 0 ? (
            <p className="muted">No scores yet for {currentPlayer.name}.</p>
          ) : (
            <ol className="compact-list">
              {recentResults.map((result) => (
                <li key={result.id}>
                  <span>{result.title}</span>
                  <strong>{result.score.toFixed(1)} sec</strong>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </main>
  );
}