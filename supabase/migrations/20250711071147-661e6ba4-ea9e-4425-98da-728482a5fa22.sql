-- Clean up votes with mismatched candidate IDs that don't exist in election_candidates
DELETE FROM public.votes 
WHERE candidate_id NOT IN (
  SELECT DISTINCT id FROM public.election_candidates
);

-- Reset all voters to allow fresh voting (clear has_voted flag and voted_at timestamp)
UPDATE public.voters 
SET has_voted = false, voted_at = NULL;