import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { SetupScreen } from './components/SetupScreen';
import type { RoundState } from './domain/types';
import type { GameSettings, ResultRecord } from './domain/types';
import { addResult, loadAppData, saveAppData } from './storage/appStorage';
import type { AppData } from './storage/appStorage';

export function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [lastResult, setLastResult] = useState<ResultRecord | null>(null);
  const navigate = useNavigate();

  useEffect(() => saveAppData(data), [data]);

  function updateData(nextData: AppData) {
    setData(nextData);
  }

  function startGame(nextSettings: GameSettings) {
    setSettings(nextSettings);
    setLastResult(null);
    navigate('/play');
  }

  function completeGame(_round: RoundState, result: ResultRecord) {
    const nextData = addResult(data, result);
    setData(nextData);
    setLastResult(result);
    navigate('/results');
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<SetupScreen data={data} onDataChange={updateData} onStart={startGame} />} />
        <Route
          path="/play"
          element={settings ? <GameScreen settings={settings} onComplete={completeGame} onQuit={() => navigate('/')} /> : <SetupScreen data={data} onDataChange={updateData} onStart={startGame} />}
        />
        <Route
          path="/results"
          element={lastResult ? <ResultsScreen data={data} result={lastResult} onDataChange={updateData} onNext={() => navigate('/')} /> : <SetupScreen data={data} onDataChange={updateData} onStart={startGame} />}
        />
      </Routes>
    </div>
  );
}