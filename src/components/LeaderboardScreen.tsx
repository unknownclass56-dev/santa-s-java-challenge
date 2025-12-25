import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  coins: number;
  total_time_seconds: number;
  difficulty_level: string;
  created_at: string;
}

interface LeaderboardScreenProps {
  currentPlayerName?: string;
  showBackButton?: boolean;
  alreadyPlayed?: boolean;
}

const LeaderboardScreen = ({ currentPlayerName, showBackButton = true, alreadyPlayed = false }: LeaderboardScreenProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_attempts',
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .order('score', { ascending: false })
        .order('total_time_seconds', { ascending: true })
        .limit(50);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1: return 'leaderboard-rank-1';
      case 2: return 'leaderboard-rank-2';
      case 3: return 'leaderboard-rank-3';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="christmas-title text-4xl md:text-5xl mb-2">
            🏆 Leaderboard 🏆
          </h1>
          <p className="text-muted-foreground">
            Top Java Quiz Champions
          </p>
          {alreadyPlayed && (
            <div className="mt-4 p-4 rounded-xl bg-christmas-gold/20 border border-christmas-gold/50 inline-block">
              <p className="text-christmas-gold font-semibold">
                🎄 You have already played this quiz from this device 🎄
              </p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="christmas-card">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">🎄</div>
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎅</div>
              <p className="text-xl text-muted-foreground">No entries yet!</p>
              <p className="text-muted-foreground">Be the first to take the quiz!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm text-muted-foreground font-semibold">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Coins</div>
                <div className="col-span-2 text-center">Time</div>
                <div className="col-span-1 text-center">Level</div>
              </div>

              {/* Entries */}
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentPlayer = entry.username === currentPlayerName;
                
                return (
                  <div
                    key={entry.id}
                    className={`leaderboard-row ${getRankClass(rank)} ${
                      isCurrentPlayer ? 'ring-2 ring-christmas-gold' : ''
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1 text-xl font-bold">
                        {getRankEmoji(rank)}
                      </div>
                      <div className="col-span-4 font-semibold flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        <span className="truncate">{entry.username}</span>
                        {isCurrentPlayer && (
                          <span className="text-xs bg-christmas-gold/30 text-christmas-gold px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="font-bold text-christmas-gold">{entry.score}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="flex items-center justify-center gap-1">
                          🪙 {entry.coins}
                        </span>
                      </div>
                      <div className="col-span-2 text-center text-sm text-muted-foreground">
                        {formatTime(entry.total_time_seconds)}
                      </div>
                      <div className="col-span-1 text-center">
                        <span className={`difficulty-badge difficulty-${entry.difficulty_level} text-xs`}>
                          {entry.difficulty_level.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Refresh button */}
        <div className="text-center mt-6">
          <button
            onClick={fetchLeaderboard}
            className="px-6 py-3 bg-card border border-border rounded-xl hover:border-christmas-gold transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Decorative elements */}
        <div className="fixed bottom-4 left-4 text-4xl animate-float opacity-50">🎄</div>
        <div className="fixed bottom-4 right-4 text-4xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🎁</div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
