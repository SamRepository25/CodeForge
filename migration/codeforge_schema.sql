-- =====================================================================
-- CodeForge — full schema for self-hosted Supabase migration
-- Run once in your new Supabase project's SQL editor.
-- =====================================================================

-- ---------- Enum -----------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Shared updated_at trigger fn -----------------------------
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =====================================================================
-- profiles
-- =====================================================================
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text UNIQUE,
  display_name  text,
  avatar_url    text,
  bio           text,
  github_url    text,
  linkedin_url  text,
  website_url   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- user_roles  (separate table — never store roles on profiles)
-- =====================================================================
CREATE TABLE public.user_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN auth.uid() <> _user_id THEN false
    ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
  END
$$;

-- =====================================================================
-- posts
-- =====================================================================
CREATE TABLE public.posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  excerpt       text,
  content       text NOT NULL,
  cover_image   text,
  category      text,
  tags          text[] NOT NULL DEFAULT '{}',
  published     boolean NOT NULL DEFAULT false,
  featured      boolean NOT NULL DEFAULT false,
  reading_time  integer NOT NULL DEFAULT 1,
  views         integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_posts_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =====================================================================
-- projects
-- =====================================================================
CREATE TABLE public.projects (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  slug              text NOT NULL UNIQUE,
  description       text NOT NULL,
  long_description  text,
  image_url         text,
  tags              text[] NOT NULL DEFAULT '{}',
  category          text,
  github_url        text,
  live_url          text,
  featured          boolean NOT NULL DEFAULT false,
  order_index       integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =====================================================================
-- comments
-- =====================================================================
CREATE TABLE public.comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- likes
-- =====================================================================
CREATE TABLE public.likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
GRANT ALL ON public.likes TO service_role;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_post_like_count(_post_id uuid)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(COUNT(*), 0)::int FROM public.likes WHERE post_id = _post_id
$$;
GRANT EXECUTE ON FUNCTION public.get_post_like_count(uuid) TO anon, authenticated;

-- =====================================================================
-- bookmarks
-- =====================================================================
CREATE TABLE public.bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS policies
-- =====================================================================

CREATE POLICY profiles_read_public_authors ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (auth.uid() = id
         OR EXISTS (SELECT 1 FROM public.posts p WHERE p.author_id = profiles.id AND p.published = true));
CREATE POLICY profiles_self_insert ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY user_roles_self_read ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY posts_public_read_published ON public.posts
  FOR SELECT USING (published = true OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY posts_author_insert ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY posts_author_update ON public.posts
  FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY posts_author_delete ON public.posts
  FOR DELETE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY projects_public_read ON public.projects
  FOR SELECT USING (true);
CREATE POLICY projects_admin_all ON public.projects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
         WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY comments_read_published ON public.comments
  FOR SELECT TO authenticated
  USING (auth.uid() = author_id
         OR EXISTS (SELECT 1 FROM public.posts p WHERE p.id = comments.post_id AND p.published = true));
CREATE POLICY comments_auth_insert ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY comments_author_delete ON public.comments
  FOR DELETE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY likes_select_own ON public.likes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY likes_self_insert ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY likes_self_delete ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY bookmarks_self_read ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY bookmarks_self_insert ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY bookmarks_self_delete ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- New-user trigger: auto-create profile + default 'user' role
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1))
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
