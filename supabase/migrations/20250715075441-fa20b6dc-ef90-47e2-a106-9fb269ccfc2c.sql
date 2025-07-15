-- First, let's see what we have in the votes table in detail
SELECT * FROM votes ORDER BY created_at;

-- Now let's call the recalculate function to populate vote_tallies properly
SELECT public.recalculate_vote_tallies();

-- Let's also create some realistic sample votes with correct candidate IDs
-- We'll simulate votes from the existing voter
DELETE FROM public.votes;

-- Add realistic votes using actual candidate IDs from election_candidates
INSERT INTO public.votes (voter_id, candidate_id, position_id) VALUES
-- Voter adb950be-d62f-4b4d-bbc8-4718090cf15f votes for:
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'pres_1', 'president'),           -- John Kamau for President
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'gov_kiambu_2', 'governor'),       -- Gladys Chania for Governor (Kiambu)
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'wrep_kiambu_1', 'women_rep'),     -- Ann Nyokabi for Women Rep (Kiambu)
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'mp_kiambutown_1', 'mp'),          -- Jude Njomo for MP (Kiambu Town)
('adb950be-d62f-4b4d-bbc8-4718090cf15f', 'mca_township_2', 'mca');          -- Jane Wangari for MCA (Township)

-- Let's add a few more voters with votes to make it realistic
-- First, we need to add more voters
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