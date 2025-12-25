import { useState } from 'react';
import SantaCharacter from './SantaCharacter';

interface WelcomeScreenProps {
  onStart: (name: string) => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [name, setName] = useState('');
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
    onStart(name.trim());
  };

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStart();
              }}
              placeholder="Your magical name..."
              className="christmas-input"
              maxLength={20}
            />
            {error && (
              <p className="text-destructive text-sm mt-2 text-left">{error}</p>
            )}
          </div>

          {/* Random difficulty info */}
          <div className="bg-muted/30 rounded-xl p-4 text-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xl">🎲</span>
              <span className="font-semibold text-christmas-gold">Random Difficulty Mode</span>
            </div>
            <p className="text-muted-foreground">
              Each question has a random difficulty level!
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <span>🟢</span>
                <span>Easy: 4s</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🟡</span>
                <span>Medium: 6s</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔴</span>
                <span>Hard: 8s</span>
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
