-- Clear all existing vote data to start fresh
DELETE FROM public.vote_tallies;
DELETE FROM public.votes;
UPDATE public.voters SET has_voted = false, voted_at = NULL;