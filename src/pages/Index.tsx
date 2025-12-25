import { useState } from 'react';
import Snowfall from '@/components/Snowfall';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuizScreen, { QuizResults } from '@/components/QuizScreen';
import ResultScreen from '@/components/ResultScreen';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import { useDeviceId } from '@/hooks/useDeviceId';

type Screen = 'welcome' | 'quiz' | 'result' | 'leaderboard';

const Index = () => {
  const { deviceId, hasPlayed, isChecking, existingUsername } = useDeviceId();
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<'low' | 'medium' | 'hard'>('medium');
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  // Show loading while checking device
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Snowfall />
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🎄</div>
          <h1 className="christmas-title text-4xl md:text-5xl mb-4">
            Loading...
          </h1>
          <p className="text-muted-foreground">Preparing your Christmas quiz!</p>
        </div>
      </div>
    );
  }

  // If device has already played, show leaderboard directly
  if (hasPlayed && currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-background">
        <Snowfall />
        <LeaderboardScreen 
          currentPlayerName={existingUsername || undefined} 
          showBackButton={false}
          alreadyPlayed={true}
        />
      </div>
    );
  }

  const handleStartQuiz = (name: string, selectedDifficulty: 'low' | 'medium' | 'hard') => {
    setPlayerName(name);
    setDifficulty(selectedDifficulty);
    setCurrentScreen('quiz');
  };

  const handleQuizComplete = (results: QuizResults) => {
    setQuizResults(results);
    setCurrentScreen('result');
  };

  const handleViewLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Snowfall />
      
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={handleStartQuiz} />
      )}
      
      {currentScreen === 'quiz' && (
        <QuizScreen
          playerName={playerName}
          difficulty={difficulty}
          deviceId={deviceId}
          onQuizComplete={handleQuizComplete}
        />
      )}
      
      {currentScreen === 'result' && quizResults && (
        <ResultScreen
          playerName={playerName}
          results={quizResults}
          onViewLeaderboard={handleViewLeaderboard}
        />
      )}
      
      {currentScreen === 'leaderboard' && (
        <LeaderboardScreen currentPlayerName={playerName} />
      )}
    </div>
  );
};

export default Index;
