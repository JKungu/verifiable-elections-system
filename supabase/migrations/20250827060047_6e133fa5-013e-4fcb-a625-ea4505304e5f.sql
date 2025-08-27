-- Fix critical security vulnerability in voters table RLS policies
-- Remove public read access and restrict to authorized users only

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Users can view their own voter record" ON public.voters;
DROP POLICY IF EXISTS "Users can update their own voter record" ON public.voters;
DROP POLICY IF EXISTS "Allow voter registration" ON public.voters;

-- Create secure policies that restrict access to sensitive voter data
-- Only election authorities can view voter data
CREATE POLICY "Election authorities can view all voter records"
ON public.voters
FOR SELECT
TO authenticated
USING (is_election_authority());

-- Only system auditors can view voter data for auditing purposes
CREATE POLICY "System auditors can view all voter records"
ON public.voters
FOR SELECT
TO authenticated
USING (is_system_auditor());

-- Allow voter registration during voting process (unauthenticated users)
-- This is needed for the voting flow where voters register with their details
CREATE POLICY "Allow voter registration during voting"
ON public.voters
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only election authorities can update voter records
CREATE POLICY "Election authorities can update voter records"
ON public.voters
FOR UPDATE
TO authenticated
USING (is_election_authority())
WITH CHECK (is_election_authority());

-- Only election authorities can delete voter records (if needed for data cleanup)
CREATE POLICY "Election authorities can delete voter records"
ON public.voters
FOR DELETE
TO authenticated
USING (is_election_authority());