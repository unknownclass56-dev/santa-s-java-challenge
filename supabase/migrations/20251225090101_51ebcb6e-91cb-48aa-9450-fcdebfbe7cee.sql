-- Create quiz_attempts table to track user attempts and enforce device restriction
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  device_id TEXT NOT NULL UNIQUE,
  score INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('low', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read quiz attempts (for leaderboard)
CREATE POLICY "Anyone can view quiz attempts" 
ON public.quiz_attempts 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert their attempt
CREATE POLICY "Anyone can create quiz attempt" 
ON public.quiz_attempts 
FOR INSERT 
WITH CHECK (true);

-- Create index on device_id for fast lookups
CREATE INDEX idx_quiz_attempts_device_id ON public.quiz_attempts (device_id);

-- Create index for leaderboard sorting (score desc, time asc)
CREATE INDEX idx_quiz_attempts_leaderboard ON public.quiz_attempts (score DESC, total_time_seconds ASC);

-- Enable realtime for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_attempts;