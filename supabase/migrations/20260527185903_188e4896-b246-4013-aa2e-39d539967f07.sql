
-- saved_invoices: scope to authenticated + add WITH CHECK on UPDATE
DROP POLICY IF EXISTS "Users can view own invoices" ON public.saved_invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.saved_invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.saved_invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.saved_invoices;

CREATE POLICY "Users can view own invoices" ON public.saved_invoices
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON public.saved_invoices
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON public.saved_invoices
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON public.saved_invoices
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- saved_tickets: add WITH CHECK on UPDATE (already authenticated-scoped)
DROP POLICY IF EXISTS "Users can update own tickets" ON public.saved_tickets;
CREATE POLICY "Users can update own tickets" ON public.saved_tickets
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- profiles: scope INSERT/UPDATE to authenticated
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
