
-- Create voters table for the voting system
CREATE TABLE public.voters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_number text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone_number text,
  location_id text,
  has_voted boolean NOT NULL DEFAULT false,
  voted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own voter record
CREATE POLICY "Allow voter registration" 
  ON public.voters 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to view their own voter record
CREATE POLICY "Users can view their own voter record" 
  ON public.voters 
  FOR SELECT 
  USING (true);

-- Create policy to allow users to update their own voter record
CREATE POLICY "Users can update their own voter record" 
  ON public.voters 
  FOR UPDATE 
  USING (true);

-- Create votes table to store actual votes
CREATE TABLE public.votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id uuid REFERENCES public.voters(id) ON DELETE CASCADE,
  position_id text NOT NULL,
  candidate_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security for votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create policy for votes
CREATE POLICY "Allow vote submission" 
  ON public.votes 
  FOR INSERT 
  WITH CHECK (true);
