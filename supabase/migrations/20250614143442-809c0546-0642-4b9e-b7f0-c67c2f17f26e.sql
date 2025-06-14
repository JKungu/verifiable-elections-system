
-- Create a table for positions/offices
CREATE TABLE public.positions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('national', 'county', 'constituency', 'ward')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for candidates with location specificity
CREATE TABLE public.election_candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  party TEXT NOT NULL,
  position_id TEXT REFERENCES public.positions(id),
  location_id TEXT, -- Maps to ward/constituency/county IDs from Kenya locations
  location_level TEXT CHECK (location_level IN ('national', 'county', 'constituency', 'ward')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for vote tallies by location and candidate
CREATE TABLE public.vote_tallies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id TEXT REFERENCES public.election_candidates(id),
  location_id TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert position data
INSERT INTO public.positions (id, title, level) VALUES
('president', 'President of Kenya', 'national'),
('governor', 'Governor', 'county'),
('women_rep', 'Women Representative', 'county'),
('mp', 'Member of Parliament', 'constituency'),
('mca', 'Member of County Assembly', 'ward');

-- Insert national presidential candidates (same everywhere)
INSERT INTO public.election_candidates (id, name, party, position_id, location_level) VALUES
('pres_1', 'John Kamau', 'Democratic Alliance', 'president', 'national'),
('pres_2', 'Mary Wanjiku', 'Unity Party', 'president', 'national'),
('pres_3', 'David Otieno', 'Progressive Movement', 'president', 'national');

-- Insert sample candidates for Nairobi County (location_id from Kenya locations data)
-- Governor candidates for Nairobi
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('gov_nairobi_1', 'Peter Mwangi', 'County First', 'governor', 'nairobi', 'county'),
('gov_nairobi_2', 'Grace Akinyi', 'Development Party', 'governor', 'nairobi', 'county');

-- Women Rep candidates for Nairobi
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('wrep_nairobi_1', 'Susan Njeri', 'Women First', 'women_rep', 'nairobi', 'county'),
('wrep_nairobi_2', 'Margaret Wambui', 'Equality Party', 'women_rep', 'nairobi', 'county');

-- MP candidates for Westlands Constituency
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mp_westlands_1', 'Robert Macharia', 'Grassroots Party', 'mp', 'westlands', 'constituency'),
('mp_westlands_2', 'Lucy Wambui', 'Youth Movement', 'mp', 'westlands', 'constituency');

-- MCA candidates for Parklands Ward
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('mca_parklands_1', 'Francis Mutua', 'Local Development', 'mca', 'parklands', 'ward'),
('mca_parklands_2', 'Catherine Wairimu', 'Community First', 'mca', 'parklands', 'ward');

-- Add more sample candidates for different locations
-- Governor candidates for Mombasa County
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('gov_mombasa_1', 'Ahmed Hassan', 'Coastal Unity', 'governor', 'mombasa', 'county'),
('gov_mombasa_2', 'Fatuma Ali', 'Blue Economy Party', 'governor', 'mombasa', 'county');

-- Women Rep candidates for Mombasa
INSERT INTO public.election_candidates (id, name, party, position_id, location_id, location_level) VALUES
('wrep_mombasa_1', 'Zeinab Omar', 'Coast Women Alliance', 'women_rep', 'mombasa', 'county'),
('wrep_mombasa_2', 'Joyce Mwangi', 'Progressive Women', 'women_rep', 'mombasa', 'county');

-- Create indexes for performance
CREATE INDEX idx_election_candidates_position ON public.election_candidates(position_id);
CREATE INDEX idx_election_candidates_location ON public.election_candidates(location_id);
CREATE INDEX idx_vote_tallies_candidate ON public.vote_tallies(candidate_id);
CREATE INDEX idx_vote_tallies_location ON public.vote_tallies(location_id);

-- Enable RLS (if needed for future security)
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_tallies ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access for now
CREATE POLICY "Allow public read access to positions" ON public.positions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to candidates" ON public.election_candidates FOR SELECT USING (true);
CREATE POLICY "Allow public read access to vote tallies" ON public.vote_tallies FOR SELECT USING (true);
