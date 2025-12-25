import { useEffect, useState } from 'react';

interface SantaCharacterProps {
  mood: 'idle' | 'happy' | 'sad' | 'thinking';
  showCoins?: boolean;
  coinCount?: number;
}

const SantaCharacter = ({ mood, showCoins = false, coinCount = 0 }: SantaCharacterProps) => {
  const [animationClass, setAnimationClass] = useState('');
  const [flyingCoins, setFlyingCoins] = useState<number[]>([]);

  useEffect(() => {
    if (mood === 'happy') {
      setAnimationClass('santa-happy');
      // Create flying coins
      const newCoins = Array.from({ length: 5 }, (_, i) => i);
      setFlyingCoins(newCoins);
      setTimeout(() => setFlyingCoins([]), 1000);
    } else if (mood === 'sad') {
      setAnimationClass('santa-sad');
    } else if (mood === 'idle') {
      setAnimationClass('santa-wave');
    } else {
      setAnimationClass('');
    }

    const timer = setTimeout(() => {
      if (mood !== 'idle') setAnimationClass('');
    }, 600);

    return () => clearTimeout(timer);
  }, [mood]);

  return (
    <div className="relative">
      {/* Floating coins animation */}
      {flyingCoins.map((coin) => (
        <div
          key={coin}
          className="absolute animate-coin-fly text-2xl"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: '20%',
            animationDelay: `${coin * 0.1}s`,
          }}
        >
          🪙
        </div>
      ))}

      {/* Santa character */}
      <div className={`text-8xl md:text-9xl ${animationClass} transition-transform duration-300`}>
        {mood === 'happy' && '🎅'}
        {mood === 'sad' && '😢'}
        {mood === 'thinking' && '🤔'}
        {mood === 'idle' && '🎅'}
      </div>

      {/* Speech bubble */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-christmas-snow text-christmas-dark px-4 py-2 rounded-xl text-sm font-semibold shadow-lg whitespace-nowrap">
        {mood === 'happy' && (
          <span className="flex items-center gap-2">
            Ho Ho Ho! 🎁 +{coinCount} coins!
          </span>
        )}
        {mood === 'sad' && (
          <span>Oh no! Try again! 🎄</span>
        )}
        {mood === 'thinking' && (
          <span>Hmm, think carefully... 🤔</span>
        )}
        {mood === 'idle' && (
          <span>Merry Christmas! 🎄</span>
        )}
        {/* Speech bubble arrow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-christmas-snow"></div>
      </div>

      {/* Decorative gifts */}
      {mood === 'happy' && (
        <>
          <div className="absolute -left-8 bottom-0 text-4xl animate-bounce-slow" style={{ animationDelay: '0.1s' }}>
            🎁
          </div>
          <div className="absolute -right-8 bottom-0 text-4xl animate-bounce-slow" style={{ animationDelay: '0.3s' }}>
            🎁
          </div>
        </>
      )}
    </div>
  );
};

export default SantaCharacter;
