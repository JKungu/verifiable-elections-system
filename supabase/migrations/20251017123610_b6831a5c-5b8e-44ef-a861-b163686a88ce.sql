-- Fix Vote Anonymity: Make voter_id nullable and remove the link
-- This preserves ballot secrecy by not linking votes to specific voters
ALTER TABLE public.votes ALTER COLUMN voter_id DROP NOT NULL;

-- Add comment explaining the security decision
COMMENT ON COLUMN public.votes.voter_id IS 'DEPRECATED: For ballot secrecy, this should remain NULL. Historical data only.';

-- Restrict vote table access to system auditors only
DROP POLICY IF EXISTS "Allow clerk dashboard to read votes" ON public.votes;
DROP POLICY IF EXISTS "Allow vote submission" ON public.votes;

-- New restrictive policies
CREATE POLICY "System auditors can view aggregated votes"
ON public.votes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.citizens
    WHERE id = auth.uid() AND user_role = 'system_auditor'
  )
);

CREATE POLICY "Anonymous vote submission allowed"
ON public.votes
FOR INSERT
WITH CHECK (voter_id IS NULL);

-- Add index for performance on anonymous votes
CREATE INDEX IF NOT EXISTS idx_votes_position_candidate 
ON public.votes(position_id, candidate_id);

-- Update vote_tallies RLS to allow public read of aggregated results
DROP POLICY IF EXISTS "Allow public read access to vote tallies" ON public.vote_tallies;

CREATE POLICY "Public can view aggregated vote tallies"
ON public.vote_tallies
FOR SELECT
USING (true);