import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AppData } from '../storage/appStorage';
import { resetScores } from '../storage/appStorage';
import type { ResultRecord } from '../domain/types';

interface ResultsScreenProps {
  data: AppData;
  result: ResultRecord;
  onDataChange: (data: AppData) => void;
  onNext: () => void;
}

export function ResultsScreen({ data, result, onDataChange, onNext }: ResultsScreenProps) {
  const playerResults = data.results
    .filter((item) => item.playerId === result.playerId && item.title === result.title)
    .sort((left, right) => left.dateIso.localeCompare(right.dateIso));
  const message = result.penaltyCount === 0
    ? `Great job, ${result.playerName}!`
    : result.penaltyCount === 1
      ? `Good job, ${result.playerName}!`
      : `Good try, ${result.playerName}!`;

  return (
    <main className="results-screen" aria-labelledby="results-title">
      <section className="results-hero panel">
        <p className="eyebrow">Round complete</p>
        <h1 id="results-title">{message}</h1>
        <div className="score-number">{result.score.toFixed(1)} sec</div>
        <div className="score-breakdown">
          <span>Time {result.elapsedSeconds.toFixed(1)} sec</span>
          <span>Penalty {result.penaltyCount} x 5 sec</span>
          <span>{result.title}</span>
        </div>
        <button className="primary-action" type="button" onClick={onNext}>Next round</button>
      </section>

      <section className="results-grid">
        <div className="panel chart-panel">
          <h2>History</h2>
          {playerResults.length < 2 ? (
            <p className="muted">Play this mode again to build a score line.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={playerResults.map((item, index) => ({ ...item, label: `${index + 1}` }))}>
                <XAxis dataKey="label" stroke="#b4adc7" />
                <YAxis stroke="#b4adc7" domain={[0, 'auto']} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} sec`, 'Score']} />
                <Line type="monotone" dataKey="score" stroke="#5dabc0" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel history-list-panel">
          <h2>Recent {result.title}</h2>
          <ol className="compact-list score-list">
            {playerResults.slice(-8).reverse().map((item) => (
              <li key={item.id}>
                <span>{new Date(item.dateIso).toLocaleDateString()}</span>
                <strong>{item.score.toFixed(1)} sec</strong>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="danger-action"
            onClick={() => onDataChange(resetScores(data, result.playerId))}
          >
            Reset {result.playerName}'s scores
          </button>
        </div>
      </section>
    </main>
  );
}