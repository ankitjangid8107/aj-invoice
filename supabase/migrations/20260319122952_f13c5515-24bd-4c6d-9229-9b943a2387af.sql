
CREATE TABLE public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT '/month',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  popular boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.pricing_plans
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public can view active plans" ON public.pricing_plans
FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.pricing_plans
FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.pricing_plans (name, price, period, features, popular, sort_order) VALUES
('Free', 0, '/forever', '["3 Invoices/month", "20-day save", "PDF & PNG export", "Basic templates"]'::jsonb, false, 1),
('Pro', 199, '/month', '["Unlimited Invoices", "90-day save", "All export formats", "Premium templates", "Priority support"]'::jsonb, true, 2),
('Business', 499, '/month', '["Everything in Pro", "Forever save", "Multi-company", "Custom branding", "API access", "Dedicated support"]'::jsonb, false, 3);

CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON public.pricing_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
