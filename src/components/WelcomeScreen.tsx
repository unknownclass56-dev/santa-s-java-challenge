import { useState } from 'react';
import SantaCharacter from './SantaCharacter';

interface WelcomeScreenProps {
  onStart: (name: string, difficulty: 'low' | 'medium' | 'hard') => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<'low' | 'medium' | 'hard'>('medium');
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!name.trim()) {
      setError('Please enter your name to start!');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters!');
      return;
    }
    if (name.trim().length > 20) {
      setError('Name must be less than 20 characters!');
      return;
    }
    onStart(name.trim(), difficulty);
  };

  const getDifficultyInfo = () => {
    switch (difficulty) {
      case 'low':
        return { timer: '4 seconds', points: '10 points', emoji: '🟢' };
      case 'medium':
        return { timer: '6 seconds', points: '20 points', emoji: '🟡' };
      case 'hard':
        return { timer: '8 seconds', points: '30 points', emoji: '🔴' };
    }
  };

  const info = getDifficultyInfo();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce-slow">🎄</div>
      <div className="absolute top-10 right-10 text-6xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🎄</div>
      <div className="absolute bottom-10 left-10 text-4xl animate-float">🎁</div>
      <div className="absolute bottom-10 right-10 text-4xl animate-float" style={{ animationDelay: '1s' }}>🎁</div>
      <div className="absolute top-1/4 left-1/4 text-3xl animate-float" style={{ animationDelay: '0.3s' }}>⭐</div>
      <div className="absolute top-1/3 right-1/4 text-3xl animate-float" style={{ animationDelay: '0.7s' }}>🔔</div>

      {/* Main content */}
      <div className="text-center z-10 max-w-xl w-full">
        {/* Title */}
        <h1 className="christmas-title mb-2">
          Java Quiz
        </h1>
        <p className="christmas-subtitle mb-8">
          🎅 Christmas Edition 🎄
        </p>

        {/* Santa */}
        <div className="mb-8">
          <SantaCharacter mood="idle" />
        </div>

        {/* Form */}
        <div className="christmas-card space-y-6">
          {/* Name input */}
          <div>
            <label className="block text-left text-muted-foreground mb-2 font-semibold">
              Enter Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Your magical name..."
              className="christmas-input"
              maxLength={20}
            />
            {error && (
              <p className="text-destructive text-sm mt-2 text-left">{error}</p>
            )}
          </div>

          {/* Difficulty selection */}
          <div>
            <label className="block text-left text-muted-foreground mb-3 font-semibold">
              Select Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    difficulty === level
                      ? level === 'low'
                        ? 'border-christmas-green bg-christmas-green/20'
                        : level === 'medium'
                        ? 'border-christmas-gold bg-christmas-gold/20'
                        : 'border-christmas-red bg-christmas-red/20'
                      : 'border-border bg-card/50 hover:border-muted-foreground'
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {level === 'low' ? '🟢' : level === 'medium' ? '🟡' : '🔴'}
                  </div>
                  <div className="font-semibold capitalize">{level}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty info */}
          <div className="bg-muted/30 rounded-xl p-4 text-sm">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span>{info.timer} per question</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <span>{info.points} each</span>
              </div>
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="christmas-button w-full"
          >
            🎮 Start Quiz
          </button>
        </div>

        {/* Info text */}
        <p className="text-muted-foreground text-sm mt-6">
          🎄 Test your Java knowledge this Christmas! 🎄
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
