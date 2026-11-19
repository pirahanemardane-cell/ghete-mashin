-- 069: stop authenticated users from granting themselves or anyone else a role.
--
-- profiles_update_own / profiles_insert_own only check auth.uid() = id.
-- RLS is row-level, so that still allows UPDATE/INSERT/UPSERT of the role column.
-- Supabase documents this gap as column-level privileges:
-- https://supabase.com/docs/guides/database/postgres/column-level-security
-- Table-level UPDATE includes every column. Revoke it, then grant only the
-- columns a customer may edit. A BEFORE trigger is the second layer so a later
-- GRANT UPDATE cannot silently reopen role changes.
--
-- Do not trust auth.jwt() -> user_metadata for authorization. End users can
-- change raw_user_meta_data through the Auth API. This migration does not copy
-- user_metadata into profiles.role. app_metadata is not consulted either.
-- Role changes are allowed only for the database owner and service_role
-- (the session role), which is how admin lifecycle actions write profiles.

CREATE OR REPLACE FUNCTION public.enforce_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_role text;
  privileged boolean;
BEGIN
  -- current_user is the session role PostgREST sets (anon, authenticated, service_role).
  -- request.jwt.claims is intentionally ignored: an authenticated SQL session can
  -- set_config that GUC, and user_metadata inside it is user-controlled.
  privileged := current_user IN ('postgres', 'supabase_admin', 'service_role');

  IF TG_OP = 'INSERT' THEN
    next_role := coalesce(NEW.role, 'customer');
    IF next_role <> 'customer' AND NOT privileged THEN
      RAISE EXCEPTION 'profile role change not permitted'
        USING ERRCODE = '42501';
    END IF;
    NEW.role := next_role;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role AND NOT privileged THEN
    RAISE EXCEPTION 'profile role change not permitted'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profiles_enforce_role ON public.profiles;
CREATE TRIGGER tr_profiles_enforce_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_role();

-- Customers may create and edit their own profile fields, not role or is_active.
REVOKE ALL ON TABLE public.profiles FROM PUBLIC;
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM authenticated;

GRANT SELECT ON TABLE public.profiles TO anon, authenticated;
GRANT INSERT (id, full_name, phone, avatar_url) ON TABLE public.profiles TO authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON TABLE public.profiles TO authenticated;
GRANT DELETE ON TABLE public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

-- Insert of a non-customer role fails in RLS as well as in the trigger.
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND coalesce(role, 'customer') = 'customer'
  );

DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Keep owner updates row-scoped. Column privileges block the role column itself.
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
