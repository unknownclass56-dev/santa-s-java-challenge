import { useEffect, useState } from 'react';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive: boolean;
  onTick?: (remaining: number) => void;
}

const Timer = ({ duration, onTimeUp, isActive, onTick }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / duration) * circumference;

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 0.1;
        if (onTick) onTick(Math.ceil(newTime));
        
        if (newTime <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, onTick]);

  const getColor = () => {
    const percentage = timeLeft / duration;
    if (percentage > 0.5) return 'hsl(142, 71%, 45%)'; // Green
    if (percentage > 0.25) return 'hsl(43, 96%, 56%)'; // Gold
    return 'hsl(0, 72%, 51%)'; // Red
  };

  const getPulseClass = () => {
    if (timeLeft <= 3 && timeLeft > 0) return 'animate-pulse';
    return '';
  };

  return (
    <div className={`timer-ring ${getPulseClass()}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="timer-ring-bg"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="timer-ring-progress"
          style={{
            stroke: getColor(),
            strokeDasharray: circumference,
            strokeDashoffset: circumference - progress,
          }}
        />
      </svg>
      {/* Time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="text-2xl md:text-3xl font-bold font-display"
          style={{ color: getColor() }}
        >
          {Math.ceil(timeLeft)}
        </span>
      </div>
    </div>
  );
};

export default Timer;
