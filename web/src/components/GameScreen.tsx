import { useEffect, useMemo, useRef, useState } from 'react';
import { applyPenalty, calculateScore, createRound, cryptoSafeId, getCurrentQuestion, getRoundTitle, getVisibleQuestions, isRoundComplete, submitCorrectAnswer } from '../domain/round';
import { isAnswerCorrect } from '../domain/questions';
import type { GameSettings, ResultRecord, RoundState } from '../domain/types';
import { soundPlayer } from '../audio/soundPlayer';

interface GameScreenProps {
  settings: GameSettings;
  onComplete: (round: RoundState, result: ResultRecord) => void;
  onQuit: () => void;
}

const keypadDigits = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'];

export function GameScreen({ settings, onComplete, onQuit }: GameScreenProps) {
  const [round, setRound] = useState(() => createRound(settings, performance.now()));
  const [answerText, setAnswerText] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const penaltyTimer = useRef<number | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const penaltyQuestionId = useRef<string | null>(null);
  const currentQuestion = getCurrentQuestion(round);
  const visibleQuestions = getVisibleQuestions(round);
  const progressPercent = Math.min(100, (round.currentIndex / round.questions.length) * 100);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds((performance.now() - round.startedAtMs) / 1000);
    }, 100);

    return () => window.clearInterval(interval);
  }, [round.startedAtMs]);

  useEffect(() => {
    return () => {
      if (penaltyTimer.current) window.clearTimeout(penaltyTimer.current);
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();
        appendDigit(event.key);
      }
      if (event.key === 'Backspace') {
        event.preventDefault();
        backspace();
      }
      if (event.key === 'Escape') {
        onQuit();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const scorePreview = useMemo(
    () => calculateScore(round.startedAtMs, performance.now(), round.penaltyCount),
    [elapsedSeconds, round.penaltyCount, round.startedAtMs]
  );

  function clearPenaltyTimer() {
    if (penaltyTimer.current) {
      window.clearTimeout(penaltyTimer.current);
      penaltyTimer.current = null;
    }
  }

  function scheduleWrongPenalty(questionId: string) {
    clearPenaltyTimer();
    penaltyTimer.current = window.setTimeout(() => {
      setRound((currentRound) => {
        const stillCurrentQuestion = getCurrentQuestion(currentRound)?.id === questionId;
        if (!stillCurrentQuestion || penaltyQuestionId.current === questionId) {
          return currentRound;
        }
        penaltyQuestionId.current = questionId;
        soundPlayer.play('wrong');
        setFeedback('wrong');
        return applyPenalty(currentRound);
      });
    }, 3000);
  }

  function handleAnswerChange(nextAnswerText: string) {
    if (!currentQuestion || isRoundComplete(round)) {
      return;
    }

    setAnswerText(nextAnswerText);
    setFeedback('idle');

    if (!nextAnswerText) {
      clearPenaltyTimer();
      return;
    }

    const answer = Number(nextAnswerText);
    if (isAnswerCorrect(currentQuestion, answer)) {
      clearPenaltyTimer();
      soundPlayer.play('correct');
      setFeedback('correct');
      advanceTimer.current = window.setTimeout(() => {
        const completedAtMs = performance.now();
        const nextRound = submitCorrectAnswer(round, answer, completedAtMs);
        setRound(nextRound);
        setAnswerText('');
        setFeedback('idle');
        penaltyQuestionId.current = null;
        if (isRoundComplete(nextRound)) {
          soundPlayer.play('complete');
          const result = makeResult(nextRound, completedAtMs);
          window.setTimeout(() => onComplete(nextRound, result), 650);
        }
      }, 250);
    } else {
      scheduleWrongPenalty(currentQuestion.id);
    }
  }

  function appendDigit(digit: string) {
    if (answerText.length >= 3) {
      soundPlayer.play('invalid');
      return;
    }
    soundPlayer.play('tap');
    handleAnswerChange(`${answerText}${digit}`);
  }

  function backspace() {
    if (!answerText) {
      soundPlayer.play('invalid');
      return;
    }
    soundPlayer.play('tap');
    handleAnswerChange(answerText.slice(0, -1));
  }

  function clearAnswer() {
    soundPlayer.play(answerText ? 'tap' : 'invalid');
    handleAnswerChange('');
  }

  function makeResult(completedRound: RoundState, completedAtMs: number): ResultRecord {
    const score = calculateScore(completedRound.startedAtMs, completedAtMs, completedRound.penaltyCount);
    return {
      ...score,
      id: cryptoSafeId('result'),
      playerId: settings.playerId,
      playerName: settings.playerName,
      dateIso: new Date().toISOString(),
      title: getRoundTitle(settings),
      operations: settings.operations,
      questionCount: settings.questionCount,
      correctCount: completedRound.correctCount
    };
  }

  return (
    <main className="game-screen" aria-labelledby="game-title">
      <header className="game-header">
        <div>
          <p className="eyebrow">{settings.playerName}</p>
          <h1 id="game-title">{getRoundTitle(settings)}</h1>
        </div>
        <button type="button" className="ghost-action" onClick={onQuit}>Quit</button>
      </header>

      <section className="progress-panel" aria-label="Round progress">
        <div className="progress-track"><div style={{ width: `${progressPercent}%` }} /></div>
        <div className="stats-row">
          <span>{Math.min(round.currentIndex + 1, round.questions.length)} / {round.questions.length}</span>
          <span>{elapsedSeconds.toFixed(1)} sec</span>
          <span>{round.penaltyCount} penalties</span>
          <span>{scorePreview.score.toFixed(1)} total</span>
        </div>
      </section>

      <section className="play-area">
        <div className="question-stack" aria-live="polite">
          {visibleQuestions.map((question, index) => (
            <div key={question.id} className={index === 0 ? `question-row active ${feedback}` : 'question-row upcoming'}>
              <span>{question.prompt}</span>
              {index === 0 && <strong className="answer-display">{answerText || ''}</strong>}
            </div>
          ))}
        </div>

        <div className="keypad" aria-label="Number pad">
          {keypadDigits.map((digit) => (
            <button key={digit} type="button" onClick={() => appendDigit(digit)}>{digit}</button>
          ))}
          <button type="button" className="utility-key" onClick={backspace}>Back</button>
          <button type="button" className="utility-key" onClick={clearAnswer}>Clear</button>
        </div>
      </section>
    </main>
  );
}