
CREATE OR REPLACE FUNCTION public.enforce_saved_expires_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_days int := 20;
  setting_val jsonb;
BEGIN
  -- Try to read invoice_save_days from site_settings (optional)
  SELECT value INTO setting_val FROM public.site_settings WHERE key = 'invoice_save_days' LIMIT 1;
  IF setting_val IS NOT NULL THEN
    BEGIN
      default_days := COALESCE((setting_val#>>'{}')::int, 20);
    EXCEPTION WHEN others THEN
      default_days := 20;
    END;
  END IF;

  IF public.has_role(NEW.user_id, 'admin'::app_role) THEN
    NEW.expires_at := now() + interval '10 years';
  ELSE
    NEW.expires_at := now() + (default_days || ' days')::interval;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_saved_expires_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_expires_at_saved_invoices ON public.saved_invoices;
CREATE TRIGGER enforce_expires_at_saved_invoices
BEFORE INSERT OR UPDATE ON public.saved_invoices
FOR EACH ROW EXECUTE FUNCTION public.enforce_saved_expires_at();

DROP TRIGGER IF EXISTS enforce_expires_at_saved_tickets ON public.saved_tickets;
CREATE TRIGGER enforce_expires_at_saved_tickets
BEFORE INSERT OR UPDATE ON public.saved_tickets
FOR EACH ROW EXECUTE FUNCTION public.enforce_saved_expires_at();
