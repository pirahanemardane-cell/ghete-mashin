-- Regression: anon/authenticated cannot change profiles.role.
-- Runs as the migration owner, then SET LOCAL ROLE to the API roles.
-- Expects 069_protect_profile_role.sql to already be applied.

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
$$;

INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'cara@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alice', 'customer'),
  ('22222222-2222-2222-2222-222222222222', 'Bob', 'customer')
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name, role = 'customer';

DO $$
DECLARE
  n int;
  bob_name text;
  alice_role text;
BEGIN
  -- Definer functions must not assign profiles.role. is_admin only reads it.
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE p.prosecdef
      AND ns.nspname = 'public'
      AND pg_get_functiondef(p.oid) ~* 'update[[:space:]]+(only[[:space:]]+)?(public\.)?profiles'
  ) THEN
    RAISE EXCEPTION 'security definer function updates profiles';
  END IF;

  PERFORM set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', '11111111-1111-1111-1111-111111111111',
      'role', 'authenticated',
      'user_metadata', json_build_object('role', 'admin')
    )::text,
    true
  );

  EXECUTE 'SET LOCAL ROLE authenticated';

  BEGIN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'self role escalation was not rejected';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;

  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Cara', 'admin');
    RAISE EXCEPTION 'insert with role admin was not rejected';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;

  BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Alice Upsert')
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name, role = 'admin';
    RAISE EXCEPTION 'upsert role escalation was not rejected';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;

  UPDATE public.profiles
  SET full_name = 'Alice Edited'
  WHERE id = '11111111-1111-1111-1111-111111111111';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'legitimate profile edit updated % rows', n;
  END IF;

  BEGIN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = '22222222-2222-2222-2222-222222222222';
    RAISE EXCEPTION 'cross-user role change was not rejected';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;

  UPDATE public.profiles
  SET full_name = 'Bob hacked'
  WHERE id = '22222222-2222-2222-2222-222222222222';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN
    RAISE EXCEPTION 'cross-user name edit changed % rows', n;
  END IF;

  EXECUTE 'RESET ROLE';

  SELECT full_name INTO bob_name
  FROM public.profiles
  WHERE id = '22222222-2222-2222-2222-222222222222';
  IF bob_name IS DISTINCT FROM 'Bob' THEN
    RAISE EXCEPTION 'bob full_name changed to %', bob_name;
  END IF;

  SELECT role INTO alice_role
  FROM public.profiles
  WHERE id = '11111111-1111-1111-1111-111111111111';
  IF alice_role IS DISTINCT FROM 'customer' THEN
    RAISE EXCEPTION 'alice role is % after rejected escalation', alice_role;
  END IF;

  IF public.is_admin() IS DISTINCT FROM false THEN
    -- claims still identify Alice, who must not be admin
    RAISE EXCEPTION 'is_admin() true for customer alice';
  END IF;

  -- Spoofed JWT role and user_metadata must not promote the session.
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', '11111111-1111-1111-1111-111111111111',
      'role', 'service_role',
      'user_metadata', json_build_object('role', 'admin')
    )::text,
    true
  );
  EXECUTE 'SET LOCAL ROLE authenticated';
  BEGIN
    UPDATE public.profiles
    SET role = 'staff'
    WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'spoofed jwt role was accepted';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;
  EXECUTE 'RESET ROLE';

  EXECUTE 'SET LOCAL ROLE anon';
  BEGIN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'anon role update was not rejected';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;
  EXECUTE 'RESET ROLE';

  EXECUTE 'SET LOCAL ROLE service_role';
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = '11111111-1111-1111-1111-111111111111';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'service_role role grant updated % rows', n;
  END IF;

  UPDATE public.profiles
  SET full_name = 'Alice Admin'
  WHERE id = '11111111-1111-1111-1111-111111111111';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'service_role profile edit updated % rows', n;
  END IF;
  EXECUTE 'RESET ROLE';

  SELECT role INTO alice_role
  FROM public.profiles
  WHERE id = '11111111-1111-1111-1111-111111111111';
  IF alice_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'service_role grant did not stick, role=%', alice_role;
  END IF;

  -- Admin session still cannot rewrite someone else's role through the user role.
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', '11111111-1111-1111-1111-111111111111',
      'role', 'authenticated'
    )::text,
    true
  );
  EXECUTE 'SET LOCAL ROLE authenticated';
  BEGIN
    UPDATE public.profiles
    SET role = 'staff'
    WHERE id = '22222222-2222-2222-2222-222222222222';
    RAISE EXCEPTION 'admin jwt changed another user role without service_role';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;
  UPDATE public.profiles
  SET full_name = 'Alice Still Admin'
  WHERE id = '11111111-1111-1111-1111-111111111111';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'admin legitimate edit updated % rows', n;
  END IF;
  EXECUTE 'RESET ROLE';

  SELECT role INTO alice_role
  FROM public.profiles
  WHERE id = '22222222-2222-2222-2222-222222222222';
  IF alice_role IS DISTINCT FROM 'customer' THEN
    RAISE EXCEPTION 'bob role changed to %', alice_role;
  END IF;
END $$;
