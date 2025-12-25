import { useState, useEffect, useCallback } from 'react';
import QuestionCard from './QuestionCard';
import Timer from './Timer';
import CoinCounter from './CoinCounter';
import SantaCharacter from './SantaCharacter';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  hasCode: boolean;
  difficulty?: 'low' | 'medium' | 'hard';
}

interface QuizScreenProps {
  playerName: string;
  deviceId: string;
  onQuizComplete: (results: QuizResults) => void;
}

export interface QuizResults {
  score: number;
  coins: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTime: number;
  difficulty: string;
}

const TOTAL_QUESTIONS = 10;
const DIFFICULTY_LEVELS: ('low' | 'medium' | 'hard')[] = ['low', 'medium', 'hard'];

const QuizScreen = ({ playerName, deviceId, onQuizComplete }: QuizScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<'low' | 'medium' | 'hard'>('medium');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [santaMood, setSantaMood] = useState<'idle' | 'happy' | 'sad' | 'thinking'>('thinking');
  const [isLoading, setIsLoading] = useState(true);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timerKey, setTimerKey] = useState(0);

  const getRandomDifficulty = (): 'low' | 'medium' | 'hard' => {
    return DIFFICULTY_LEVELS[Math.floor(Math.random() * DIFFICULTY_LEVELS.length)];
  };

  const getTimerDuration = (difficulty: 'low' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'low': return 4;
      case 'medium': return 6;
      case 'hard': return 8;
    }
  };

  const getBasePoints = (difficulty: 'low' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'low': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
    }
  };

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    setIsTimerActive(false);
    setSantaMood('thinking');

    // Generate random difficulty for this question
    const randomDifficulty = getRandomDifficulty();
    setCurrentDifficulty(randomDifficulty);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-question`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            difficulty: randomDifficulty,
            questionNumber,
            topics: null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      const data = await response.json();
      
      if (data.error && data.fallback) {
        setCurrentQuestion({ ...data.fallback, difficulty: randomDifficulty });
      } else {
        setCurrentQuestion({ ...data, difficulty: randomDifficulty });
      }
      
      setQuestionStartTime(Date.now());
      setSantaMood('idle');
      setIsLoading(false);
      setTimerKey(prev => prev + 1); // Reset timer
      setIsTimerActive(true);
    } catch (error) {
      console.error('Error fetching question:', error);
      // Use fallback question
      setCurrentQuestion({
        question: "Which keyword is used to create a subclass in Java?",
        options: ["extends", "implements", "inherits", "super"],
        correctIndex: 0,
        explanation: "The 'extends' keyword is used to create a subclass (child class) from a superclass (parent class) in Java.",
        topic: "OOPs - Inheritance",
        hasCode: false,
        difficulty: randomDifficulty
      });
      setSantaMood('idle');
      setIsLoading(false);
      setTimerKey(prev => prev + 1);
      setIsTimerActive(true);
    }
  }, [questionNumber]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleAnswer = async (selectedIndex: number, isCorrect: boolean, timeRemaining: number) => {
    setIsTimerActive(false);
    const questionTime = (Date.now() - questionStartTime) / 1000;
    setTotalTime(prev => prev + questionTime);

    if (isCorrect) {
      const basePoints = getBasePoints(currentDifficulty);
      const timeBonus = Math.floor(timeRemaining * 2);
      const totalPoints = basePoints + timeBonus;
      const coinsEarned = Math.floor(totalPoints / 5);

      setScore(prev => prev + totalPoints);
      setCoins(prev => prev + coinsEarned);
      setCorrectAnswers(prev => prev + 1);
      setEarnedCoins(coinsEarned);
      setSantaMood('happy');
      setCoinAnimation(true);
      setTimeout(() => setCoinAnimation(false), 1000);
    } else {
      setWrongAnswers(prev => prev + 1);
      setSantaMood('sad');
    }

    // Wait for animation then proceed
    setTimeout(async () => {
      if (questionNumber >= TOTAL_QUESTIONS) {
        const finalCorrect = correctAnswers + (isCorrect ? 1 : 0);
        const finalWrong = wrongAnswers + (isCorrect ? 0 : 1);
        const finalScore = score + (isCorrect ? getBasePoints(currentDifficulty) + Math.floor((timeRemaining || 0) * 2) : 0);
        const finalCoins = coins + (isCorrect ? Math.floor((getBasePoints(currentDifficulty) + Math.floor((timeRemaining || 0) * 2)) / 5) : 0);
        const finalTime = Math.floor(totalTime + (Date.now() - questionStartTime) / 1000);

        const results: QuizResults = {
          score: finalScore,
          coins: finalCoins,
          correctAnswers: finalCorrect,
          wrongAnswers: finalWrong,
          totalTime: finalTime,
          difficulty: 'mixed',
        };

        // Save to database
        try {
          await supabase.from('quiz_attempts').insert({
            username: playerName,
            device_id: deviceId,
            score: results.score,
            coins: results.coins,
            correct_answers: results.correctAnswers,
            wrong_answers: results.wrongAnswers,
            total_time_seconds: results.totalTime,
            difficulty_level: 'medium', // Store as medium for mixed mode
          });
        } catch (error) {
          console.error('Error saving results:', error);
        }

        onQuizComplete(results);
      } else {
        setQuestionNumber(prev => prev + 1);
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    if (currentQuestion) {
      handleAnswer(-1, false, 0);
    }
  };

  const getDifficultyEmoji = (diff: 'low' | 'medium' | 'hard') => {
    switch (diff) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Player info */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <span className="font-semibold text-lg">{playerName}</span>
            <span className={`difficulty-badge difficulty-${currentDifficulty} flex items-center gap-1`}>
              {getDifficultyEmoji(currentDifficulty)} {currentDifficulty.toUpperCase()}
            </span>
          </div>

          {/* Score and coins */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-border">
              <span className="text-xl">🏆</span>
              <span className="font-bold text-lg">{score}</span>
            </div>
            <CoinCounter coins={coins} showAnimation={coinAnimation} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_auto] gap-6 items-start">
        {/* Question area */}
        <div className="flex-1">
          {isLoading ? (
            <div className="christmas-card text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">🎄</div>
              <p className="text-xl text-muted-foreground">Generating question...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Difficulty: {getDifficultyEmoji(currentDifficulty)} {currentDifficulty.toUpperCase()}
              </p>
            </div>
          ) : currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              questionNumber={questionNumber}
              totalQuestions={TOTAL_QUESTIONS}
              onAnswer={handleAnswer}
              disabled={!isTimerActive}
              difficulty={currentDifficulty}
            />
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col items-center gap-6 md:sticky md:top-8">
          {/* Timer */}
          <Timer
            key={timerKey}
            duration={getTimerDuration(currentDifficulty)}
            onTimeUp={handleTimeUp}
            isActive={isTimerActive && !isLoading}
          />

          {/* Santa */}
          <SantaCharacter 
            mood={santaMood} 
            showCoins={coinAnimation}
            coinCount={earnedCoins}
          />

          {/* Progress */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Progress</div>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < questionNumber - 1
                      ? 'bg-christmas-green'
                      : i === questionNumber - 1
                      ? 'bg-christmas-gold animate-pulse'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-4 left-4 text-4xl animate-float opacity-50">🎁</div>
      <div className="fixed bottom-4 right-4 text-4xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🔔</div>
    </div>
  );
};

export default QuizScreen;
