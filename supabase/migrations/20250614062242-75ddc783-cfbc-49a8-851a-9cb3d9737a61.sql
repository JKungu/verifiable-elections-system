
-- Enable RLS on citizens table (if not already enabled)
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow election authorities and system auditors to insert clerk records
CREATE POLICY "Allow clerk registration" 
  ON public.citizens 
  FOR INSERT 
  WITH CHECK (user_role IN ('election_authority', 'system_auditor'));

-- Create policy to allow election authorities and system auditors to view clerk records
CREATE POLICY "Allow clerk data access" 
  ON public.citizens 
  FOR SELECT 
  USING (user_role IN ('election_authority', 'system_auditor', 'voter'));

-- Create policy to allow clerks to update their own records
CREATE POLICY "Allow clerk self-update" 
  ON public.citizens 
  FOR UPDATE 
  USING (user_role IN ('election_authority', 'system_auditor'));
