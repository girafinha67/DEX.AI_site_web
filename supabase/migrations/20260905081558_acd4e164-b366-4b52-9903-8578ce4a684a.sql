CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  workspace_name TEXT NOT NULL DEFAULT 'Meu workspace',
  plan TEXT NOT NULL DEFAULT 'free',
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_product BOOLEAN NOT NULL DEFAULT true,
  notify_limits BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, workspace_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), COALESCE(NEW.email, ''), 'Prosvia')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.send_rules (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TABLE public.send_rules (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  min_interval_days INTEGER NOT NULL DEFAULT 7,
  daily_limit INTEGER NOT NULL DEFAULT 30,
  allowed_from TEXT NOT NULL DEFAULT '09:00',
  allowed_to TEXT NOT NULL DEFAULT '18:00',
  retention_days INTEGER NOT NULL DEFAULT 365,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.send_rules TO authenticated;
GRANT ALL ON public.send_rules TO service_role;
ALTER TABLE public.send_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own send rules" ON public.send_rules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_send_rules_updated BEFORE UPDATE ON public.send_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  niche TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  neighborhood TEXT,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.searches TO authenticated;
GRANT ALL ON public.searches TO service_role;
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own searches" ON public.searches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_searches_user ON public.searches (user_id, created_at DESC);

CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  name TEXT NOT NULL,
  niche TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  neighborhood TEXT,
  phone TEXT NOT NULL,
  rating NUMERIC(2,1),
  reviews_count INTEGER NOT NULL DEFAULT 0,
  website TEXT,
  address TEXT,
  maps_url TEXT,
  opportunity TEXT NOT NULL DEFAULT 'media',
  opportunity_score INTEGER NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  contacted BOOLEAN NOT NULL DEFAULT false,
  contacted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, place_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own leads" ON public.leads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_leads_user ON public.leads (user_id, created_at DESC);
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT 'violet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lists TO authenticated;
GRANT ALL ON public.lists TO service_role;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lists" ON public.lists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_lists_updated BEFORE UPDATE ON public.lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.list_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.lists ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (list_id, lead_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.list_leads TO authenticated;
GRANT ALL ON public.list_leads TO service_role;
ALTER TABLE public.list_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own list leads" ON public.list_leads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_templates TO authenticated;
GRANT ALL ON public.message_templates TO service_role;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own templates" ON public.message_templates FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.contact_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads ON DELETE SET NULL,
  template_id UUID REFERENCES public.message_templates ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviada',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_history TO authenticated;
GRANT ALL ON public.contact_history TO service_role;
ALTER TABLE public.contact_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own history" ON public.contact_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_history_user ON public.contact_history (user_id, sent_at DESC);

CREATE TABLE public.blocked_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  phone TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_numbers TO authenticated;
GRANT ALL ON public.blocked_numbers TO service_role;
ALTER TABLE public.blocked_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own blocked" ON public.blocked_numbers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
