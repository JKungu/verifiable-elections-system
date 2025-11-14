-- Link voters table to Supabase auth for secure authentication
-- This fixes the localStorage authentication vulnerability

-- Add auth_id column to voters table to link with auth.users
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_voters_auth_id ON public.voters(auth_id);

-- Add unique constraint to prevent duplicate auth accounts
ALTER TABLE public.voters ADD CONSTRAINT unique_voter_auth_id UNIQUE (auth_id);

-- Update RLS policies for voters table
DROP POLICY IF EXISTS "Allow voter registration during voting" ON public.voters;
DROP POLICY IF EXISTS "Election authorities can view all voter records" ON public.voters;
DROP POLICY IF EXISTS "Election authorities can update voter records" ON public.voters;
DROP POLICY IF EXISTS "Election authorities can delete voter records" ON public.voters;
DROP POLICY IF EXISTS "System auditors can view all voter records" ON public.voters;

-- Voters can view their own record
CREATE POLICY "Voters can view own record"
ON public.voters FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- Voters can insert their own record during registration
CREATE POLICY "Voters can register themselves"
ON public.voters FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_id);

-- Voters can update their own voting status
CREATE POLICY "Voters can update own voting status"
ON public.voters FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Election authorities can view all voter records
CREATE POLICY "Election authorities view all voters"
ON public.voters FOR SELECT
TO authenticated
USING (is_election_authority());

-- Election authorities can update voter records
CREATE POLICY "Election authorities update voters"
ON public.voters FOR UPDATE
TO authenticated
USING (is_election_authority())
WITH CHECK (is_election_authority());

-- Election authorities can delete voter records
CREATE POLICY "Election authorities delete voters"
ON public.voters FOR DELETE
TO authenticated
USING (is_election_authority());

-- System auditors can view all voter records
CREATE POLICY "System auditors view all voters"
ON public.voters FOR SELECT
TO authenticated
USING (is_system_auditor());

-- Create function to check if voter has already voted
CREATE OR REPLACE FUNCTION public.check_voter_eligibility(_auth_id uuid)
RETURNS TABLE (
  eligible boolean,
  reason text,
  voter_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  voter_record record;
BEGIN
  -- Get voter record
  SELECT * INTO voter_record
  FROM public.voters
  WHERE auth_id = _auth_id;
  
  -- If no record, voter needs to register
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Voter not registered'::text, NULL::jsonb;
    RETURN;
  END IF;
  
  -- If already voted, not eligible
  IF voter_record.has_voted THEN
    RETURN QUERY SELECT false, 'Already voted'::text, row_to_json(voter_record)::jsonb;
    RETURN;
  END IF;
  
  -- Eligible to vote
  RETURN QUERY SELECT true, 'Eligible'::text, row_to_json(voter_record)::jsonb;
END;
$$;

-- Create function to mark voter as voted (atomic operation)
CREATE OR REPLACE FUNCTION public.mark_voter_as_voted(_auth_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.voters
  SET has_voted = true,
      voted_at = now(),
      updated_at = now()
  WHERE auth_id = _auth_id
    AND has_voted = false; -- Prevent double voting
  
  -- Return true if row was updated
  RETURN FOUND;
END;
$$;