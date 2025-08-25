-- Add missing candidates for specific ward locations that voters are assigned to

-- First, add MCA candidates for ward-0552
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level, image_url) VALUES
('mca-ward-0552-1', 'James Kipchoge', 'Jubilee Party', 'mca', 'ward-0552', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mca-ward-0552-2', 'Mary Wanjiku', 'ODM', 'mca', 'ward-0552', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mca-ward-0552-3', 'Peter Otieno', 'UDA', 'mca', 'ward-0552', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png');

-- Add MCA candidates for ward-0558
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level, image_url) VALUES
('mca-ward-0558-1', 'Grace Muthoni', 'Jubilee Party', 'mca', 'ward-0558', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mca-ward-0558-2', 'Samuel Kiprotich', 'ODM', 'mca', 'ward-0558', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mca-ward-0558-3', 'Nancy Njoroge', 'UDA', 'mca', 'ward-0558', 'ward', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png');

-- Update the VoterCandidatesPage filtering to be more flexible for location matching
-- Add MP candidates for constituencies related to these wards
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level, image_url) VALUES
('mp-constituency-552-1', 'David Mwangi', 'Jubilee Party', 'mp', 'constituency-552', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mp-constituency-552-2', 'Alice Nyambura', 'ODM', 'mp', 'constituency-552', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mp-constituency-552-3', 'John Kamau', 'UDA', 'mp', 'constituency-552', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),

('mp-constituency-558-1', 'Sarah Wangari', 'Jubilee Party', 'mp', 'constituency-558', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mp-constituency-558-2', 'Moses Kiptoo', 'ODM', 'mp', 'constituency-558', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png'),
('mp-constituency-558-3', 'Jane Mutiso', 'UDA', 'mp', 'constituency-558', 'constituency', '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png');