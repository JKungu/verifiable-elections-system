-- Fix vote tallying logic to properly handle presidential candidates and location-based candidates
-- Presidential candidates should have national tallies, others should be location-specific

-- First, let's update the trigger function to handle presidential vs location-based candidates correctly
CREATE OR REPLACE FUNCTION public.update_vote_tallies_on_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_position_id text;
  v_location_id text;
  v_tally_location_id text;
BEGIN
  -- Get the position for this vote
  SELECT position_id INTO v_position_id FROM public.votes WHERE id = NEW.id;
  
  -- Get voter location
  SELECT COALESCE(location_id, 'default') INTO v_location_id 
  FROM public.voters WHERE id = NEW.voter_id;
  
  -- Determine tally location based on position
  IF v_position_id = 'president' THEN
    -- Presidential candidates should have national tallies
    v_tally_location_id := 'national';
  ELSE
    -- All other positions are location-based
    v_tally_location_id := v_location_id;
  END IF;
  
  -- Delete existing tally for this candidate-location combination
  DELETE FROM public.vote_tallies 
  WHERE candidate_id = NEW.candidate_id 
  AND location_id = v_tally_location_id;
  
  -- Insert updated tally
  INSERT INTO public.vote_tallies (candidate_id, location_id, vote_count, last_updated)
  SELECT 
    NEW.candidate_id,
    v_tally_location_id,
    COUNT(*) as vote_count,
    NOW() as last_updated
  FROM public.votes v
  LEFT JOIN public.voters vr ON v.voter_id = vr.id
  WHERE v.candidate_id = NEW.candidate_id 
  AND (
    -- For presidential candidates, count all votes nationally
    (v_position_id = 'president') OR
    -- For other positions, count votes from the same location
    (v_position_id != 'president' AND COALESCE(vr.location_id, 'default') = v_location_id)
  )
  GROUP BY v.candidate_id;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_vote_tallies ON public.votes;
CREATE TRIGGER trigger_update_vote_tallies
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vote_tallies_on_vote();

-- Clear existing vote tallies and recalculate with correct logic
DELETE FROM public.vote_tallies;

-- Recalculate vote tallies with correct location handling
-- Presidential candidates - national tallies
INSERT INTO public.vote_tallies (candidate_id, location_id, vote_count, last_updated)
SELECT 
  v.candidate_id,
  'national' as location_id,
  COUNT(*) as vote_count,
  NOW() as last_updated
FROM public.votes v
WHERE v.position_id = 'president'
GROUP BY v.candidate_id;

-- Other positions - location-based tallies
INSERT INTO public.vote_tallies (candidate_id, location_id, vote_count, last_updated)
SELECT 
  v.candidate_id,
  COALESCE(vr.location_id, 'default') as location_id,
  COUNT(*) as vote_count,
  NOW() as last_updated
FROM public.votes v
LEFT JOIN public.voters vr ON v.voter_id = vr.id
WHERE v.position_id != 'president'
GROUP BY v.candidate_id, COALESCE(vr.location_id, 'default');