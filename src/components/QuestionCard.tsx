import { useState, useEffect } from 'react';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  hasCode: boolean;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number, isCorrect: boolean, timeRemaining: number) => void;
  disabled: boolean;
}

const QuestionCard = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswer, 
  disabled 
}: QuestionCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
  }, [question]);

  const handleOptionClick = (index: number, timeRemaining: number = 0) => {
    if (disabled || selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === question.correctIndex;
    
    // Delay before moving to next question
    setTimeout(() => {
      onAnswer(index, isCorrect, timeRemaining);
    }, 1500);
  };

  const getOptionClass = (index: number) => {
    if (!showResult) return 'option-button';
    if (index === question.correctIndex) return 'option-button correct';
    if (index === selectedAnswer && index !== question.correctIndex) return 'option-button wrong';
    return 'option-button opacity-50';
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  // Format question text (handle code blocks)
  const formatQuestion = (text: string) => {
    if (question.hasCode || text.includes('\n') || text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('```')) {
          const code = part.replace(/```\w*\n?/g, '').replace(/```/g, '');
          return (
            <div key={idx} className="code-block my-4">
              <code>{code}</code>
            </div>
          );
        }
        return part.split('\n').map((line, lineIdx) => (
          <span key={`${idx}-${lineIdx}`}>
            {line}
            {lineIdx < part.split('\n').length - 1 && <br />}
          </span>
        ));
      });
    }
    return text;
  };

  return (
    <div className="christmas-card animate-fade-in">
      {/* Question header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📝</span>
          <span className="text-christmas-gold font-semibold">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        <span className="difficulty-badge difficulty-medium">
          {question.topic}
        </span>
      </div>

      {/* Question text */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
          {formatQuestion(question.question)}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={disabled || selectedAnswer !== null}
            className={getOptionClass(index)}
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {optionLabels[index]}
              </span>
              <span className="flex-1 text-base md:text-lg text-foreground/90 pt-1.5">
                {option}
              </span>
              {showResult && index === question.correctIndex && (
                <span className="text-2xl">✅</span>
              )}
              {showResult && index === selectedAnswer && index !== question.correctIndex && (
                <span className="text-2xl">❌</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation (shown after answer) */}
      {showResult && (
        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-christmas-gold mb-1">Explanation:</p>
              <p className="text-muted-foreground">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
