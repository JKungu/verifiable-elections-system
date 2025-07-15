-- Create the function to recalculate vote tallies from actual votes
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

-- Clear all existing vote data to start fresh
DELETE FROM public.vote_tallies;
DELETE FROM public.votes;

-- Add realistic votes using actual candidate IDs from election_candidates
INSERT INTO public.votes (voter_id, candidate_id, position_id) VALUES
-- Voter adb950be-d62f-4b4d-bbc8-4718090cf15f votes for:
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'pres_1', 'president'),           -- John Kamau for President
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'gov_kiambu_2', 'governor'),       -- Gladys Chania for Governor (Kiambu)
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'wrep_kiambu_1', 'women_rep'),     -- Ann Nyokabi for Women Rep (Kiambu)
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'mp_kiambutown_1', 'mp'),          -- Jude Njomo for MP (Kiambu Town)
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'mca_township_2', 'mca');          -- Jane Wangari for MCA (Township)

-- Add a few more voters with votes to make it realistic
INSERT INTO public.voters (id, id_number, first_name, last_name, phone_number, location_id, has_voted, voted_at) VALUES
('11111111-1111-1111-1111-111111111111', 'ID002', 'Jane', 'Smith', '+254712345678', 'kiambu', true, now()),
('22222222-2222-2222-2222-222222222222', 'ID003', 'Peter', 'Mwangi', '+254733456789', 'kiambu', true, now()),
('33333333-3333-3333-3333-333333333333', 'ID004', 'Grace', 'Wanjiku', '+254744567890', 'nairobi', true, now());

-- Add their votes
INSERT INTO public.votes (voter_id, candidate_id, position_id) VALUES
-- Jane Smith votes
('11111111-1111-1111-1111-111111111111', 'pres_2', 'president'),           -- Mary Wanjiku for President
('11111111-1111-1111-1111-111111111111', 'gov_kiambu_1', 'governor'),       -- Kimani Wamatangi for Governor
('11111111-1111-1111-1111-111111111111', 'wrep_kiambu_2', 'women_rep'),     -- Gathoni Wamuchomba for Women Rep
('11111111-1111-1111-1111-111111111111', 'mp_kiambutown_2', 'mp'),          -- George Koimburi for MP
('11111111-1111-1111-1111-111111111111', 'mca_township_1', 'mca'),          -- Francis Munyua for MCA

-- Peter Mwangi votes  
('22222222-2222-2222-2222-222222222222', 'pres_1', 'president'),           -- John Kamau for President
('22222222-2222-2222-2222-222222222222', 'gov_kiambu_1', 'governor'),       -- Kimani Wamatangi for Governor
('22222222-2222-2222-2222-222222222222', 'wrep_kiambu_3', 'women_rep'),     -- Mary Wambui for Women Rep
('22222222-2222-2222-2222-222222222222', 'mp_kiambutown_3', 'mp'),          -- Peter Kihara for MP
('22222222-2222-2222-2222-222222222222', 'mca_township_3', 'mca'),          -- Samuel Karanja for MCA

-- Grace Wanjiku votes (from Nairobi)
('33333333-3333-3333-3333-333333333333', 'pres_3', 'president'),           -- David Otieno for President
('33333333-3333-3333-3333-333333333333', 'gov_nairobi_1', 'governor'),      -- Johnson Sakaja for Governor
('33333333-3333-3333-3333-333333333333', 'wrep_nairobi_1', 'women_rep'),    -- Esther Passaris for Women Rep
('33333333-3333-3333-3333-333333333333', 'mp_westlands_1', 'mp'),           -- Tim Wanyonyi for MP
('33333333-3333-3333-3333-333333333333', 'mca_parklands_1', 'mca');         -- Jayesh Saini for MCA

-- Now recalculate the vote tallies with the correct data
SELECT public.recalculate_vote_tallies();