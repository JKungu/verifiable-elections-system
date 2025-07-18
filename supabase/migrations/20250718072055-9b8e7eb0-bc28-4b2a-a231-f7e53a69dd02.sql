-- Fix RLS policies for vote_tallies table to allow trigger updates
-- The trigger needs to be able to insert/update vote tallies automatically

-- First, let's allow the system to insert/update vote tallies
CREATE POLICY "Allow system to manage vote tallies" 
ON public.vote_tallies 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Ensure the trigger exists and is properly configured
CREATE OR REPLACE FUNCTION public.update_vote_tallies_on_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Delete existing tally for this candidate-location combination
  DELETE FROM public.vote_tallies 
  WHERE candidate_id = NEW.candidate_id 
  AND location_id = (SELECT COALESCE(location_id, 'default') FROM public.voters WHERE id = NEW.voter_id);
  
  -- Insert updated tally
  INSERT INTO public.vote_tallies (candidate_id, location_id, vote_count, last_updated)
  SELECT 
    NEW.candidate_id,
    COALESCE(vr.location_id, 'default') as location_id,
    COUNT(*) as vote_count,
    NOW() as last_updated
  FROM public.votes v
  LEFT JOIN public.voters vr ON v.voter_id = vr.id
  WHERE v.candidate_id = NEW.candidate_id 
  AND COALESCE(vr.location_id, 'default') = (SELECT COALESCE(location_id, 'default') FROM public.voters WHERE id = NEW.voter_id)
  GROUP BY v.candidate_id, COALESCE(vr.location_id, 'default');
  
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on votes table
DROP TRIGGER IF EXISTS trigger_update_vote_tallies ON public.votes;
CREATE TRIGGER trigger_update_vote_tallies
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vote_tallies_on_vote();