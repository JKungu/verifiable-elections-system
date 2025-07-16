-- First, let's ensure vote tallies can be managed properly
-- Grant permissions for vote tallies management
GRANT ALL ON public.vote_tallies TO authenticated;
GRANT ALL ON public.vote_tallies TO service_role;

-- Recalculate vote tallies to include recent votes
DELETE FROM public.vote_tallies;

-- Insert actual vote counts grouped by candidate and location
INSERT INTO public.vote_tallies (candidate_id, location_id, vote_count, last_updated)
SELECT 
  v.candidate_id,
  COALESCE(vr.location_id, 'default') as location_id,
  COUNT(*) as vote_count,
  NOW() as last_updated
FROM public.votes v
LEFT JOIN public.voters vr ON v.voter_id = vr.id
WHERE v.candidate_id IS NOT NULL
GROUP BY v.candidate_id, COALESCE(vr.location_id, 'default');