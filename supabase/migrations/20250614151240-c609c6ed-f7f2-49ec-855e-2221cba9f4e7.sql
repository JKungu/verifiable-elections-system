
-- Add more candidates for different counties, constituencies, and wards

-- Governor candidates for different counties
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
-- Kiambu County governors
('gov_kiambu_1', 'Peter Njoroge', 'Development First', 'governor', 'kiambu', 'county'),
('gov_kiambu_2', 'Grace Wambui', 'Unity Alliance', 'governor', 'kiambu', 'county'),
('gov_kiambu_3', 'James Kariuki', 'Progressive Party', 'governor', 'kiambu', 'county'),

-- Machakos County governors  
('gov_machakos_1', 'Stephen Mutiso', 'People Power', 'governor', 'machakos', 'county'),
('gov_machakos_2', 'Mary Nduku', 'Change Movement', 'governor', 'machakos', 'county'),
('gov_machakos_3', 'Daniel Musyoka', 'Reform Party', 'governor', 'machakos', 'county'),

-- Nakuru County governors
('gov_nakuru_1', 'Joseph Kipkemboi', 'Rift Valley Unity', 'governor', 'nakuru', 'county'),
('gov_nakuru_2', 'Sarah Chelimo', 'Highland Party', 'governor', 'nakuru', 'county'),

-- Kisumu County governors
('gov_kisumu_1', 'Tom Ochieng', 'Lake Region Party', 'governor', 'kisumu', 'county'),
('gov_kisumu_2', 'Grace Atieno', 'Progressive Alliance', 'governor', 'kisumu', 'county');

-- Women Representatives for different counties
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
-- Kiambu County women reps
('wrep_kiambu_1', 'Jane Wanjiku', 'Women Empowerment', 'women_rep', 'kiambu', 'county'),
('wrep_kiambu_2', 'Ruth Nyokabi', 'Gender Equality Party', 'women_rep', 'kiambu', 'county'),

-- Machakos County women reps
('wrep_machakos_1', 'Agnes Musyimi', 'Women First Movement', 'women_rep', 'machakos', 'county'),
('wrep_machakos_2', 'Esther Muthoni', 'Empowerment Alliance', 'women_rep', 'machakos', 'county'),

-- Nakuru County women reps
('wrep_nakuru_1', 'Rebecca Kiplagat', 'Women Unity', 'women_rep', 'nakuru', 'county'),
('wrep_nakuru_2', 'Joyce Wanjiru', 'Highland Women', 'women_rep', 'nakuru', 'county'),

-- Kisumu County women reps
('wrep_kisumu_1', 'Millicent Ouma', 'Lake Women Alliance', 'women_rep', 'kisumu', 'county'),
('wrep_kisumu_2', 'Faith Adhiambo', 'Nyanza Unity', 'women_rep', 'kisumu', 'county');

-- MP candidates for different constituencies
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
-- Kiambu Town Constituency MPs
('mp_kiambutown_1', 'Michael Kinyua', 'Town Development', 'mp', 'kiambutown', 'constituency'),
('mp_kiambutown_2', 'Lucy Waithera', 'Urban Progress', 'mp', 'kiambutown', 'constituency'),
('mp_kiambutown_3', 'Samuel Kamau', 'Local First', 'mp', 'kiambutown', 'constituency'),

-- Thika Town Constituency MPs
('mp_thikatown_1', 'Patrick Mwangi', 'Industrial Party', 'mp', 'thikatown', 'constituency'),
('mp_thikatown_2', 'Anne Wanjeri', 'Business Alliance', 'mp', 'thikatown', 'constituency'),

-- Machakos Town Constituency MPs
('mp_machakostwon_1', 'John Mutua', 'Town Unity', 'mp', 'machakostwon', 'constituency'),
('mp_machakostwon_2', 'Grace Mwikali', 'Development Focus', 'mp', 'machakostwon', 'constituency'),

-- Nakuru Town East Constituency MPs
('mp_nakurutowneast_1', 'David Kimani', 'East Progress', 'mp', 'nakurutowneast', 'constituency'),
('mp_nakurutowneast_2', 'Susan Wanjiku', 'Urban Development', 'mp', 'nakurutowneast', 'constituency'),

-- Kisumu East Constituency MPs
('mp_kisumueast_1', 'Robert Onyango', 'East Alliance', 'mp', 'kisumueast', 'constituency'),
('mp_kisumueast_2', 'Mary Akinyi', 'Lakeside Unity', 'mp', 'kisumueast', 'constituency');

-- MCA candidates for different wards
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
-- Kiambu Town wards
('mca_kiambutowncentral_1', 'Francis Gitau', 'Central Development', 'mca', 'kiambutowncentral', 'ward'),
('mca_kiambutowncentral_2', 'Mary Njoki', 'Ward Progress', 'mca', 'kiambutowncentral', 'ward'),
('mca_kiambutowncentral_3', 'Peter Muchiri', 'Community First', 'mca', 'kiambutowncentral', 'ward'),

('mca_kiambutowneast_1', 'Joseph Karanja', 'East Ward Unity', 'mca', 'kiambutowneast', 'ward'),
('mca_kiambutowneast_2', 'Grace Wambui', 'Local Development', 'mca', 'kiambutowneast', 'ward'),

-- Thika Town wards
('mca_thikatowncentral_1', 'Daniel Mwangi', 'Thika Progress', 'mca', 'thikatowncentral', 'ward'),
('mca_thikatowncentral_2', 'Jane Wanjiku', 'Central Unity', 'mca', 'thikatowncentral', 'ward'),

('mca_thikatowneast_1', 'Paul Kamau', 'East Thika Alliance', 'mca', 'thikatowneast', 'ward'),
('mca_thikatowneast_2', 'Susan Nyambura', 'Community Development', 'mca', 'thikatowneast', 'ward'),

-- Machakos wards
('mca_machakoscentral_1', 'Stephen Kioko', 'Central Machakos', 'mca', 'machakoscentral', 'ward'),
('mca_machakoscentral_2', 'Agnes Mutindi', 'Ward Unity', 'mca', 'machakoscentral', 'ward'),

-- Nakuru wards
('mca_nakurucentral_1', 'James Kiplagat', 'Nakuru Central', 'mca', 'nakurucentral', 'ward'),
('mca_nakurucentral_2', 'Joyce Chemutai', 'Central Progress', 'mca', 'nakurucentral', 'ward'),

-- Kisumu wards
('mca_kisumumarketsquare_1', 'Thomas Ochieng', 'Market Development', 'mca', 'kisumumarketsquare', 'ward'),
('mca_kisumumarketsquare_2', 'Eunice Awino', 'Square Unity', 'mca', 'kisumumarketsquare', 'ward');

-- Create some sample vote tallies for realistic data
INSERT INTO public.vote_tallies (candidate_id, location_id, vote_count) VALUES
-- Presidential votes in different locations
('pres_1', 'nairobi', 1250),
('pres_2', 'nairobi', 980),
('pres_3', 'nairobi', 720),

('pres_1', 'kiambu', 890),
('pres_2', 'kiambu', 1100),
('pres_3', 'kiambu', 650),

-- Governor votes
('gov_nairobi_1', 'nairobi', 1650),
('gov_nairobi_2', 'nairobi', 1280),

('gov_kiambu_1', 'kiambu', 1200),
('gov_kiambu_2', 'kiambu', 980),
('gov_kiambu_3', 'kiambu', 760),

-- Women rep votes
('wrep_nairobi_1', 'nairobi', 1850),
('wrep_nairobi_2', 'nairobi', 1080),

('wrep_kiambu_1', 'kiambu', 1350),
('wrep_kiambu_2', 'kiambu', 1280),

-- MP votes
('mp_westlands_1', 'westlands', 850),
('mp_westlands_2', 'westlands', 1150),

('mp_kiambutown_1', 'kiambutown', 950),
('mp_kiambutown_2', 'kiambutown', 780),
('mp_kiambutown_3', 'kiambutown', 650),

-- MCA votes
('mca_parklands_1', 'parklands', 420),
('mca_parklands_2', 'parklands', 580),

('mca_kiambutowncentral_1', 'kiambutowncentral', 380),
('mca_kiambutowncentral_2', 'kiambutowncentral', 320),
('mca_kiambutowncentral_3', 'kiambutowncentral', 280);
