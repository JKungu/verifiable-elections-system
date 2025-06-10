
-- Create enum types for user roles and election status
CREATE TYPE user_role AS ENUM ('voter', 'election_authority', 'system_auditor');
CREATE TYPE election_status AS ENUM ('draft', 'active', 'closed', 'finalized');
CREATE TYPE audit_action AS ENUM ('vote_cast', 'vote_changed', 'election_created', 'election_activated', 'election_closed', 'user_login', 'user_logout', 'admin_action');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Citizens table with identity & verification info
CREATE TABLE public.citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone_number TEXT,
  verification_status verification_status DEFAULT 'pending',
  verification_document_url TEXT,
  user_role user_role DEFAULT 'voter',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Elections table
CREATE TABLE public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status election_status DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  voting_start TIMESTAMP WITH TIME ZONE NOT NULL,
  voting_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.citizens(id) NOT NULL,
  total_votes INTEGER DEFAULT 0,
  encryption_key_hash TEXT, -- For vote encryption
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  party TEXT,
  description TEXT,
  image_url TEXT,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ballots table (encrypted votes)
CREATE TABLE public.ballots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  encrypted_vote TEXT NOT NULL, -- Encrypted candidate selection
  vote_hash TEXT UNIQUE NOT NULL, -- For verification without revealing identity
  cast_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT
);

-- Voter-ballot mapping table (for allowing vote changes)
CREATE TABLE public.voter_ballots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES public.citizens(id) NOT NULL,
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  current_ballot_id UUID REFERENCES public.ballots(id),
  previous_ballot_ids UUID[], -- Array of previous ballot IDs for audit
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(citizen_id, election_id)
);

-- Sessions & devices for MFA
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES public.citizens(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  ip_address INET,
  user_agent TEXT,
  is_mobile_id BOOLEAN DEFAULT false,
  mfa_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit logs for cryptographic audit trail
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL, -- 'election', 'vote', 'user', etc.
  entity_id UUID,
  citizen_id UUID REFERENCES public.citizens(id),
  election_id UUID REFERENCES public.elections(id),
  details JSONB, -- Additional audit details
  ip_address INET,
  user_agent TEXT,
  cryptographic_hash TEXT NOT NULL, -- For blockchain-style logging
  previous_hash TEXT, -- Link to previous audit entry
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- MFA tokens table
CREATE TABLE public.mfa_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES public.citizens(id) ON DELETE CASCADE NOT NULL,
  token_hash TEXT NOT NULL,
  token_type TEXT NOT NULL, -- 'sms', 'email', 'mobile_id'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ballots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_ballots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_tokens ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_citizen_role()
RETURNS user_role AS $$
  SELECT user_role FROM public.citizens WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_election_authority()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.citizens 
    WHERE id = auth.uid() AND user_role = 'election_authority'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_system_auditor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.citizens 
    WHERE id = auth.uid() AND user_role = 'system_auditor'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for citizens table
CREATE POLICY "Citizens can view their own profile" ON public.citizens
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Election authorities can view all citizens" ON public.citizens
  FOR SELECT USING (public.is_election_authority());

CREATE POLICY "System auditors can view all citizens" ON public.citizens
  FOR SELECT USING (public.is_system_auditor());

CREATE POLICY "Citizens can update their own profile" ON public.citizens
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Election authorities can manage citizens" ON public.citizens
  FOR ALL USING (public.is_election_authority());

-- RLS Policies for elections table
CREATE POLICY "Anyone can view active elections" ON public.elections
  FOR SELECT USING (status IN ('active', 'closed', 'finalized'));

CREATE POLICY "Election authorities can manage elections" ON public.elections
  FOR ALL USING (public.is_election_authority());

CREATE POLICY "System auditors can view all elections" ON public.elections
  FOR SELECT USING (public.is_system_auditor());

-- RLS Policies for candidates table
CREATE POLICY "Anyone can view candidates for active elections" ON public.candidates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.elections 
      WHERE id = election_id AND status IN ('active', 'closed', 'finalized')
    )
  );

CREATE POLICY "Election authorities can manage candidates" ON public.candidates
  FOR ALL USING (public.is_election_authority());

-- RLS Policies for ballots table (highly restricted)
CREATE POLICY "System auditors can view ballot metadata" ON public.ballots
  FOR SELECT USING (public.is_system_auditor());

CREATE POLICY "Election authorities can insert ballots" ON public.ballots
  FOR INSERT WITH CHECK (public.is_election_authority());

-- RLS Policies for voter_ballots table
CREATE POLICY "Citizens can view their own voting records" ON public.voter_ballots
  FOR SELECT USING (auth.uid() = citizen_id);

CREATE POLICY "Election authorities can view voting records" ON public.voter_ballots
  FOR SELECT USING (public.is_election_authority());

CREATE POLICY "System can insert voting records" ON public.voter_ballots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update voting records" ON public.voter_ballots
  FOR UPDATE USING (true);

-- RLS Policies for user_sessions table
CREATE POLICY "Citizens can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = citizen_id);

CREATE POLICY "Citizens can manage their own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = citizen_id);

CREATE POLICY "System auditors can view all sessions" ON public.user_sessions
  FOR SELECT USING (public.is_system_auditor());

-- RLS Policies for audit_logs table
CREATE POLICY "System auditors can view all audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_system_auditor());

CREATE POLICY "Election authorities can view election audit logs" ON public.audit_logs
  FOR SELECT USING (
    public.is_election_authority() AND action IN ('vote_cast', 'vote_changed', 'election_created', 'election_activated', 'election_closed')
  );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for mfa_tokens table
CREATE POLICY "Citizens can view their own MFA tokens" ON public.mfa_tokens
  FOR SELECT USING (auth.uid() = citizen_id);

CREATE POLICY "System can manage MFA tokens" ON public.mfa_tokens
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_citizens_national_id ON public.citizens(national_id);
CREATE INDEX idx_citizens_email ON public.citizens(email);
CREATE INDEX idx_elections_status ON public.elections(status);
CREATE INDEX idx_elections_dates ON public.elections(voting_start, voting_end);
CREATE INDEX idx_candidates_election ON public.candidates(election_id);
CREATE INDEX idx_ballots_election ON public.ballots(election_id);
CREATE INDEX idx_ballots_hash ON public.ballots(vote_hash);
CREATE INDEX idx_voter_ballots_citizen_election ON public.voter_ballots(citizen_id, election_id);
CREATE INDEX idx_user_sessions_citizen ON public.user_sessions(citizen_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_audit_logs_citizen ON public.audit_logs(citizen_id);
CREATE INDEX idx_audit_logs_election ON public.audit_logs(election_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_mfa_tokens_citizen ON public.mfa_tokens(citizen_id);

-- Function to generate cryptographic hash for audit trail
CREATE OR REPLACE FUNCTION public.generate_audit_hash(
  action_text TEXT,
  entity_data TEXT,
  previous_hash TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    digest(
      action_text || entity_data || COALESCE(previous_hash, '') || extract(epoch from now())::text,
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_action audit_action,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_citizen_id UUID DEFAULT NULL,
  p_election_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_previous_hash TEXT;
  v_new_hash TEXT;
  v_audit_id UUID;
BEGIN
  -- Get the most recent hash for blockchain-style linking
  SELECT cryptographic_hash INTO v_previous_hash
  FROM public.audit_logs
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Generate new hash
  v_new_hash := public.generate_audit_hash(
    p_action::text,
    COALESCE(p_entity_id::text, '') || COALESCE(p_details::text, ''),
    v_previous_hash
  );
  
  -- Insert audit log
  INSERT INTO public.audit_logs (
    action, entity_type, entity_id, citizen_id, election_id,
    details, ip_address, user_agent, cryptographic_hash, previous_hash
  ) VALUES (
    p_action, p_entity_type, p_entity_id, p_citizen_id, p_election_id,
    p_details, p_ip_address, p_user_agent, v_new_hash, v_previous_hash
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update election vote counts
CREATE OR REPLACE FUNCTION public.update_election_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.elections 
    SET total_votes = total_votes + 1,
        updated_at = now()
    WHERE id = NEW.election_id;
    
    -- Also update candidate vote count if we can decrypt the vote
    -- This would be handled by the application layer with proper decryption
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_vote_count
  AFTER INSERT ON public.ballots
  FOR EACH ROW EXECUTE FUNCTION public.update_election_vote_count();

-- Function to handle vote replacement (when user changes vote)
CREATE OR REPLACE FUNCTION public.cast_or_update_vote(
  p_citizen_id UUID,
  p_election_id UUID,
  p_encrypted_vote TEXT,
  p_vote_hash TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_fingerprint TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_ballot_id UUID;
  v_existing_ballot_id UUID;
  v_previous_ballots UUID[];
BEGIN
  -- Insert new ballot
  INSERT INTO public.ballots (
    election_id, encrypted_vote, vote_hash, ip_address, user_agent, device_fingerprint
  ) VALUES (
    p_election_id, p_encrypted_vote, p_vote_hash, p_ip_address, p_user_agent, p_device_fingerprint
  ) RETURNING id INTO v_ballot_id;
  
  -- Check if citizen has already voted
  SELECT current_ballot_id, previous_ballot_ids
  INTO v_existing_ballot_id, v_previous_ballots
  FROM public.voter_ballots
  WHERE citizen_id = p_citizen_id AND election_id = p_election_id;
  
  IF v_existing_ballot_id IS NOT NULL THEN
    -- Update existing vote record
    UPDATE public.voter_ballots
    SET current_ballot_id = v_ballot_id,
        previous_ballot_ids = COALESCE(v_previous_ballots, ARRAY[]::UUID[]) || v_existing_ballot_id,
        voted_at = now()
    WHERE citizen_id = p_citizen_id AND election_id = p_election_id;
    
    -- Create audit log for vote change
    PERFORM public.create_audit_log(
      'vote_changed',
      'ballot',
      v_ballot_id,
      p_citizen_id,
      p_election_id,
      jsonb_build_object('previous_ballot_id', v_existing_ballot_id),
      p_ip_address,
      p_user_agent
    );
  ELSE
    -- Insert new vote record
    INSERT INTO public.voter_ballots (citizen_id, election_id, current_ballot_id)
    VALUES (p_citizen_id, p_election_id, v_ballot_id);
    
    -- Create audit log for new vote
    PERFORM public.create_audit_log(
      'vote_cast',
      'ballot',
      v_ballot_id,
      p_citizen_id,
      p_election_id,
      jsonb_build_object('first_vote', true),
      p_ip_address,
      p_user_agent
    );
  END IF;
  
  RETURN v_ballot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
