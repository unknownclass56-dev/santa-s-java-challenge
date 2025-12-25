import { useEffect, useState } from 'react';
import type { QuizResults } from './QuizScreen';
import SantaCharacter from './SantaCharacter';
import CoinCounter from './CoinCounter';

interface ResultScreenProps {
  playerName: string;
  results: QuizResults;
  onViewLeaderboard: () => void;
}

const ResultScreen = ({ playerName, results, onViewLeaderboard }: ResultScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; emoji: string }[]>([]);

  useEffect(() => {
    // Create confetti
    const emojis = ['🎄', '⭐', '🎁', '🔔', '❄️', '🪙', '✨'];
    const confettiItems = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      emoji: emojis[i % emojis.length],
    }));
    setConfetti(confettiItems);

    // Show content with delay
    setTimeout(() => setShowContent(true), 500);
  }, []);

  const getGrade = () => {
    const percentage = (results.correctAnswers / 10) * 100;
    if (percentage >= 90) return { grade: 'A+', message: 'Outstanding! 🌟', color: 'text-christmas-gold' };
    if (percentage >= 80) return { grade: 'A', message: 'Excellent! 🎉', color: 'text-christmas-green' };
    if (percentage >= 70) return { grade: 'B', message: 'Great Job! 👏', color: 'text-blue-400' };
    if (percentage >= 60) return { grade: 'C', message: 'Good Effort! 💪', color: 'text-yellow-400' };
    if (percentage >= 50) return { grade: 'D', message: 'Keep Practicing! 📚', color: 'text-orange-400' };
    return { grade: 'F', message: 'Try Again! 🎯', color: 'text-christmas-red' };
  };

  const gradeInfo = getGrade();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map((item) => (
        <div
          key={item.id}
          className="fixed text-3xl animate-coin-fly pointer-events-none"
          style={{
            left: `${item.left}%`,
            top: '-20px',
            animationDelay: `${item.delay}s`,
            animationDuration: '3s',
            animationIterationCount: 'infinite',
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Main content */}
      <div className={`max-w-lg w-full transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="christmas-title text-4xl md:text-5xl mb-2">
            Quiz Complete!
          </h1>
          <p className="text-xl text-muted-foreground">
            Well done, {playerName}! 🎄
          </p>
        </div>

        {/* Santa */}
        <div className="flex justify-center mb-8">
          <SantaCharacter mood={results.correctAnswers >= 5 ? 'happy' : 'sad'} />
        </div>

        {/* Results card */}
        <div className="christmas-card animate-celebrate">
          {/* Grade */}
          <div className="text-center mb-6">
            <div className={`text-7xl font-display font-bold ${gradeInfo.color}`}>
              {gradeInfo.grade}
            </div>
            <p className="text-xl mt-2">{gradeInfo.message}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">🏆</div>
              <div className="text-2xl font-bold text-christmas-gold">{results.score}</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">🪙</div>
              <div className="text-2xl font-bold text-christmas-gold">{results.coins}</div>
              <div className="text-sm text-muted-foreground">Coins Earned</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">✅</div>
              <div className="text-2xl font-bold text-christmas-green">{results.correctAnswers}/10</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">⏱️</div>
              <div className="text-2xl font-bold">{formatTime(results.totalTime)}</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
          </div>

          {/* Difficulty badge */}
          <div className="flex justify-center mb-6">
            <span className={`difficulty-badge difficulty-${results.difficulty}`}>
              {results.difficulty.toUpperCase()} Level
            </span>
          </div>

          {/* View leaderboard button */}
          <button
            onClick={onViewLeaderboard}
            className="christmas-button christmas-button-green w-full"
          >
            🏅 View Leaderboard
          </button>
        </div>

        {/* Encouragement */}
        <p className="text-center text-muted-foreground mt-6">
          🎅 Santa is proud of you! Happy Holidays! 🎄
        </p>
      </div>
    </div>
  );
};

export default ResultScreen;
