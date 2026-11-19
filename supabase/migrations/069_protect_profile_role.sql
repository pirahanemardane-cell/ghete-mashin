-- 069: Prevent privilege escalation via profiles.role / is_active
-- Root cause: RLS profiles_update_own / profiles_insert_own allowed any column
-- change on the caller's own row, so an authenticated user could
-- UPDATE profiles SET role = 'admin' WHERE id = auth.uid().
-- Role changes are service_role only (admin server actions use the service client).

CREATE OR REPLACE FUNCTION public.enforce_profile_privilege_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF jwt_role IS DISTINCT FROM 'service_role' THEN
      NEW.role := 'customer';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role AND jwt_role IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'privilege escalation denied: profile.role is not self-service'
        USING ERRCODE = '42501';
    END IF;

    IF NEW.is_active IS DISTINCT FROM OLD.is_active
       AND jwt_role IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'privilege escalation denied: profile.is_active is not self-service'
        USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profiles_privilege_guard ON public.profiles;
CREATE TRIGGER tr_profiles_privilege_guard
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_privilege_guard();

-- Tighten INSERT: authenticated users may only create their own customer row
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'customer');

-- Keep UPDATE own-row policy; trigger enforces immutable privileged columns
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
