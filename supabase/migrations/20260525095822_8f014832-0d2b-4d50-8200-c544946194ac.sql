-- 1. Fix subscriptions: remove user INSERT capability (only admins or service role via edge function)
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;

-- 2. Fix user_roles: prevent privilege escalation
-- The ALL policy already only applies to admins via USING. Add explicit deny for non-admin inserts
-- by replacing with a restrictive INSERT policy that requires admin role
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix pricing_plans: only show active plans to authenticated non-admins
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.pricing_plans;
CREATE POLICY "Authenticated can view active plans"
ON public.pricing_plans
FOR SELECT
TO authenticated
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- 4. Fix site_settings: restrict to admins; expose public keys via function
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;

CREATE POLICY "Admins can read all settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public settings accessor (whitelisted keys only)
CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE(key text, value jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT key, value FROM public.site_settings
  WHERE key IN ('site_name', 'site_description', 'adsense_enabled', 'adsense_code', 'invoice_save_days');
$$;

REVOKE EXECUTE ON FUNCTION public.get_public_site_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_site_settings() TO anon, authenticated;

-- 5. Revoke public execute on has_role (still callable from RLS policies as definer)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;