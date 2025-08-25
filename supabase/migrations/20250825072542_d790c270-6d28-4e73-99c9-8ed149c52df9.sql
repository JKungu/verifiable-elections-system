-- Add missing candidates for ward locations with unique IDs

-- Add MCA candidates for ward-0552 (different IDs)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level, image_url) VALUES
('mca-ward-552-a', 'James Kipchoge', 'Jubilee Party', 'mca', 'ward-0552', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mca-ward-552-b', 'Mary Wanjiku', 'ODM', 'mca', 'ward-0552', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mca-ward-552-c', 'Peter Otieno', 'UDA', 'mca', 'ward-0552', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png');

-- Add MCA candidates for ward-0558 (different IDs)
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level, image_url) VALUES
('mca-ward-558-a', 'Grace Muthoni', 'Jubilee Party', 'mca', 'ward-0558', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mca-ward-558-b', 'Samuel Kiprotich', 'ODM', 'mca', 'ward-0558', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mca-ward-558-c', 'Nancy Njoroge', 'UDA', 'mca', 'ward-0558', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png');

-- Add MP candidates for these ward areas 
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level, image_url) VALUES
('mp-const-552-a', 'David Mwangi', 'Jubilee Party', 'mp', 'kiambutown', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mp-const-552-b', 'Alice Nyambura', 'ODM', 'mp', 'kiambutown', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),

('mp-const-558-a', 'Sarah Wangari', 'Jubilee Party', 'mp', 'westlands', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mp-const-558-b', 'Moses Kiptoo', 'ODM', 'mp', 'westlands', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png');