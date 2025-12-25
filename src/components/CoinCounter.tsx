interface CoinCounterProps {
  coins: number;
  showAnimation?: boolean;
}

const CoinCounter = ({ coins, showAnimation = false }: CoinCounterProps) => {
  return (
    <div className={`coin-counter ${showAnimation ? 'animate-pulse-glow' : ''}`}>
      <span className="text-2xl">🪙</span>
      <span className="text-xl font-bold text-christmas-gold">{coins}</span>
    </div>
  );
};

export default CoinCounter;
