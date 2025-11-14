-- Fix critical privilege escalation vulnerability by separating roles from user profiles
-- This prevents users from promoting themselves to admin

-- Step 1: Create separate user_roles table (reusing existing user_role enum)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Step 2: Migrate existing roles from citizens table to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT id, user_role, created_at
FROM public.citizens
WHERE user_role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for user_roles
-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only system auditors can assign roles (using subquery to avoid recursion)
CREATE POLICY "Only system auditors assign roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'system_auditor'
  )
);

-- Only system auditors can update roles
CREATE POLICY "Only system auditors update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'system_auditor'
  )
);

-- Only system auditors can delete roles
CREATE POLICY "Only system auditors delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'system_auditor'
  )
);

-- Step 5: Create secure has_role function with fixed search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 6: Update is_election_authority function to use has_role
CREATE OR REPLACE FUNCTION public.is_election_authority()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'election_authority');
$$;

-- Step 7: Update is_system_auditor function to use has_role
CREATE OR REPLACE FUNCTION public.is_system_auditor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'system_auditor');
$$;

-- Step 8: Update get_current_citizen_role to use user_roles table
CREATE OR REPLACE FUNCTION public.get_current_citizen_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Step 9: Drop the dangerous RLS policy that allows unrestricted self-update
DROP POLICY IF EXISTS "Citizens can update their own profile" ON public.citizens;

-- Step 10: Create safe RLS policy allowing only non-sensitive field updates
-- Users can update their profile but NOT user_role or verification_status
CREATE POLICY "Citizens can update own safe profile fields"
ON public.citizens FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 11: Create trigger to prevent role column updates via citizens table
CREATE OR REPLACE FUNCTION public.prevent_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent any changes to user_role column
  IF NEW.user_role IS DISTINCT FROM OLD.user_role THEN
    RAISE EXCEPTION 'Direct role updates not allowed. Use user_roles table instead.';
  END IF;
  
  -- Prevent any changes to verification_status by non-admins
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF NOT public.is_election_authority() THEN
      RAISE EXCEPTION 'Only election authorities can change verification status.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_role_immutability
BEFORE UPDATE ON public.citizens
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_changes();

-- Step 12: Create audit log trigger for role assignments
CREATE OR REPLACE FUNCTION public.audit_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_audit_log(
      'role_assigned',
      'user_roles',
      NEW.id,
      NEW.user_id,
      NULL,
      jsonb_build_object('role', NEW.role, 'assigned_by', NEW.assigned_by),
      NULL,
      NULL
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.create_audit_log(
      'role_removed',
      'user_roles',
      OLD.id,
      OLD.user_id,
      NULL,
      jsonb_build_object('role', OLD.role),
      NULL,
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_role_changes
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_role_assignment();