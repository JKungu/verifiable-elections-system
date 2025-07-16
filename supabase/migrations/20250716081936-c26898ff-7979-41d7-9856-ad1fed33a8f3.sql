-- Add MCA candidates for Murera ward (Kiambu County, Juja Constituency)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mca_murera_1', 'Stephen Githaka', 'United Democratic Alliance', 'mca', 'murera', 'ward'),
('mca_murera_2', 'Grace Wanjiru', 'Jubilee Party', 'mca', 'murera', 'ward'),
('mca_murera_3', 'John Kamau', 'Orange Democratic Movement', 'mca', 'murera', 'ward'),
('mca_murera_4', 'Susan Njeri', 'Independent', 'mca', 'murera', 'ward');

-- Add MCA candidates for other common wards that might be missing
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mca_ward0547_1', 'Patrick Njoroge', 'United Democratic Alliance', 'mca', 'ward-0547', 'ward'),
('mca_ward0547_2', 'Mary Wanjiku', 'Jubilee Party', 'mca', 'ward-0547', 'ward'),
('mca_ward0547_3', 'James Kariuki', 'Orange Democratic Movement', 'mca', 'ward-0547', 'ward'),
('mca_ward0547_4', 'Alice Nyambura', 'Independent', 'mca', 'ward-0547', 'ward');