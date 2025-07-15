-- Clear fake vote tallies and reset with actual vote counts
DELETE FROM public.vote_tallies;

-- Create a function to recalculate vote tallies from actual votes
CREATE OR REPLACE FUNCTION public.recalculate_vote_tallies()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clear existing tallies
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
END;
$$;

-- Call the function to populate with real data
SELECT public.recalculate_vote_tallies();