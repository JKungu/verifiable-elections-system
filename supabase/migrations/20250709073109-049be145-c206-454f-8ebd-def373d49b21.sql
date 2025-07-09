-- First, clear the vote tallies that reference location-specific candidates
DELETE FROM public.vote_tallies WHERE candidate_id NOT IN (
  SELECT id FROM public.election_candidates WHERE location_level = 'national'
);

-- Clear existing location-specific candidates (keep presidential candidates)
DELETE FROM public.election_candidates WHERE location_level != 'national';

-- Nairobi County Candidates
-- Governor candidates for Nairobi
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('gov_nairobi_1', 'Johnson Sakaja', 'United Democratic Alliance', 'governor', 'nairobi', 'county'),
('gov_nairobi_2', 'Polycarp Igathe', 'Azimio la Umoja', 'governor', 'nairobi', 'county'),
('gov_nairobi_3', 'Agnes Kagure', 'Independent', 'governor', 'nairobi', 'county');

-- Women Rep candidates for Nairobi
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('wrep_nairobi_1', 'Esther Passaris', 'Orange Democratic Movement', 'women_rep', 'nairobi', 'county'),
('wrep_nairobi_2', 'Millicent Omanga', 'United Democratic Alliance', 'women_rep', 'nairobi', 'county'),
('wrep_nairobi_3', 'Karen Nyamu', 'Independent', 'women_rep', 'nairobi', 'county');

-- Westlands Constituency (Nairobi)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mp_westlands_1', 'Tim Wanyonyi', 'Orange Democratic Movement', 'mp', 'westlands', 'constituency'),
('mp_westlands_2', 'Nelson Havi', 'United Democratic Alliance', 'mp', 'westlands', 'constituency'),
('mp_westlands_3', 'Susan Kiprotich', 'Independent', 'mp', 'westlands', 'constituency');

-- Parklands Ward (Westlands)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mca_parklands_1', 'Jayesh Saini', 'Orange Democratic Movement', 'mca', 'parklands', 'ward'),
('mca_parklands_2', 'David Mberia', 'United Democratic Alliance', 'mca', 'parklands', 'ward'),
('mca_parklands_3', 'Grace Wanjiku', 'Independent', 'mca', 'parklands', 'ward');

-- Kiambu County Candidates
-- Governor candidates for Kiambu
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('gov_kiambu_1', 'Kimani Wamatangi', 'United Democratic Alliance', 'governor', 'kiambu', 'county'),
('gov_kiambu_2', 'Gladys Chania', 'Jubilee Party', 'governor', 'kiambu', 'county'),
('gov_kiambu_3', 'William Kabogo', 'Independent', 'governor', 'kiambu', 'county');

-- Women Rep candidates for Kiambu
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('wrep_kiambu_1', 'Ann Nyokabi', 'United Democratic Alliance', 'women_rep', 'kiambu', 'county'),
('wrep_kiambu_2', 'Gathoni Wamuchomba', 'Independent', 'women_rep', 'kiambu', 'county'),
('wrep_kiambu_3', 'Mary Wambui', 'Jubilee Party', 'women_rep', 'kiambu', 'county');

-- Kiambu Town Constituency
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mp_kiambutown_1', 'Jude Njomo', 'United Democratic Alliance', 'mp', 'kiambutown', 'constituency'),
('mp_kiambutown_2', 'George Koimburi', 'Jubilee Party', 'mp', 'kiambutown', 'constituency'),
('mp_kiambutown_3', 'Peter Kihara', 'Independent', 'mp', 'kiambutown', 'constituency');

-- Township Ward (Kiambu Town)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mca_township_1', 'Francis Munyua', 'United Democratic Alliance', 'mca', 'township', 'ward'),
('mca_township_2', 'Jane Wangari', 'Jubilee Party', 'mca', 'township', 'ward'),
('mca_township_3', 'Samuel Karanja', 'Independent', 'mca', 'township', 'ward');

-- Mombasa County Candidates
-- Governor candidates for Mombasa
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('gov_mombasa_1', 'Abdulswamad Nassir', 'Orange Democratic Movement', 'governor', 'mombasa', 'county'),
('gov_mombasa_2', 'Hassan Omar', 'United Democratic Alliance', 'governor', 'mombasa', 'county'),
('gov_mombasa_3', 'Suleiman Shahbal', 'Independent', 'governor', 'mombasa', 'county');

-- Women Rep candidates for Mombasa
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('wrep_mombasa_1', 'Zamzam Mohammed', 'Orange Democratic Movement', 'women_rep', 'mombasa', 'county'),
('wrep_mombasa_2', 'Asha Hussein', 'United Democratic Alliance', 'women_rep', 'mombasa', 'county'),
('wrep_mombasa_3', 'Fatuma Ali', 'Independent', 'women_rep', 'mombasa', 'county');

-- Mvita Constituency (Mombasa)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mp_mvita_1', 'Abdulswamad Nassir', 'Orange Democratic Movement', 'mp', 'mvita', 'constituency'),
('mp_mvita_2', 'Omar Shimbwa', 'United Democratic Alliance', 'mp', 'mvita', 'constituency'),
('mp_mvita_3', 'Ali Hassan', 'Independent', 'mp', 'mvita', 'constituency');

-- Majengo Ward (Mvita)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mca_majengo_1', 'Hassan Kombo', 'Orange Democratic Movement', 'mca', 'majengo', 'ward'),
('mca_majengo_2', 'Amina Said', 'United Democratic Alliance', 'mca', 'majengo', 'ward'),
('mca_majengo_3', 'Mohamed Ali', 'Independent', 'mca', 'majengo', 'ward');

-- Nakuru County Candidates
-- Governor candidates for Nakuru
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('gov_nakuru_1', 'Susan Kihika', 'United Democratic Alliance', 'governor', 'nakuru', 'county'),
('gov_nakuru_2', 'Lee Kinyanjui', 'Jubilee Party', 'governor', 'nakuru', 'county'),
('gov_nakuru_3', 'Tabitha Karanja', 'Independent', 'governor', 'nakuru', 'county');

-- Women Rep candidates for Nakuru
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('wrep_nakuru_1', 'Liza Chelule', 'United Democratic Alliance', 'women_rep', 'nakuru', 'county'),
('wrep_nakuru_2', 'Susan Kihika', 'Independent', 'women_rep', 'nakuru', 'county'),
('wrep_nakuru_3', 'Jane Kihara', 'Jubilee Party', 'women_rep', 'nakuru', 'county');

-- Nakuru Town East Constituency
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mp_nakurutowneast_1', 'David Gikaria', 'United Democratic Alliance', 'mp', 'nakurutowneast', 'constituency'),
('mp_nakurutowneast_2', 'Samuel Arama', 'Jubilee Party', 'mp', 'nakurutowneast', 'constituency'),
('mp_nakurutowneast_3', 'Grace Wanjiru', 'Independent', 'mp', 'nakurutowneast', 'constituency');

-- Biashara Ward (Nakuru Town East)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mca_biashara_1', 'Anthony Mbugua', 'United Democratic Alliance', 'mca', 'biashara', 'ward'),
('mca_biashara_2', 'Mary Kamau', 'Jubilee Party', 'mca', 'biashara', 'ward'),
('mca_biashara_3', 'John Kariuki', 'Independent', 'mca', 'biashara', 'ward');

-- Kisumu County Candidates
-- Governor candidates for Kisumu
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('gov_kisumu_1', 'Anyang Nyongo', 'Orange Democratic Movement', 'governor', 'kisumu', 'county'),
('gov_kisumu_2', 'Jack Ranguma', 'Movement for Democracy and Growth', 'governor', 'kisumu', 'county'),
('gov_kisumu_3', 'Ken Obura', 'Independent', 'governor', 'kisumu', 'county');

-- Women Rep candidates for Kisumu
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('wrep_kisumu_1', 'Rosa Buyu', 'Orange Democratic Movement', 'women_rep', 'kisumu', 'county'),
('wrep_kisumu_2', 'Grace Akumu', 'Movement for Democracy and Growth', 'women_rep', 'kisumu', 'county'),
('wrep_kisumu_3', 'Judith Atieno', 'Independent', 'women_rep', 'kisumu', 'county');

-- Kisumu East Constituency
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mp_kisumueast_1', 'Shakeel Shabbir', 'Orange Democratic Movement', 'mp', 'kisumueast', 'constituency'),
('mp_kisumueast_2', 'Fred Ouda', 'Movement for Democracy and Growth', 'mp', 'kisumueast', 'constituency'),
('mp_kisumueast_3', 'Elizabeth Ongoro', 'Independent', 'mp', 'kisumueast', 'constituency');

-- Kolwa Central Ward (Kisumu East)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mca_kolwacentral_1', 'Joachim Oketch', 'Orange Democratic Movement', 'mca', 'kolwacentral', 'ward'),
('mca_kolwacentral_2', 'Nancy Achieng', 'Movement for Democracy and Growth', 'mca', 'kolwacentral', 'ward'),
('mca_kolwacentral_3', 'Peter Ochieng', 'Independent', 'mca', 'kolwacentral', 'ward');