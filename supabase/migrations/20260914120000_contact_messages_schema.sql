-- Contact system: messages + attachments
--
-- Security model:
-- 1) No INSERT policy exists for anon/authenticated on either table.
--    The only way a row is created is through the trusted server function,
--    which uses the service-role client (bypasses RLS entirely). Public
--    visitors never talk to these tables directly with their own Supabase key.
-- 2) SELECT is admin-only (has_role check).
-- 3) UPDATE/DELETE (marking read, archiving, deleting) reuse the existing
--    MFA-aware admin-write gate from current_user_admin_write_allowed().

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  subject text CHECK (subject IS NULL OR char_length(subject) <= 200),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL CHECK (char_length(file_name) BETWEEN 1 AND 255),
  mime_type text NOT NULL,
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 8388608),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_messages_status_created_idx ON public.contact_messages (status, created_at DESC);
CREATE INDEX contact_messages_ip_hash_created_idx ON public.contact_messages (ip_hash, created_at DESC);
CREATE INDEX contact_attachments_message_id_idx ON public.contact_attachments (message_id);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_attachments ENABLE ROW LEVEL SECURITY;

-- No INSERT policy on either table: only the service-role server function can create rows.

CREATE POLICY contact_messages_admin_read ON public.contact_messages
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY contact_messages_admin_write ON public.contact_messages
  FOR UPDATE
  USING (public.current_user_admin_write_allowed())
  WITH CHECK (public.current_user_admin_write_allowed());

CREATE POLICY contact_messages_admin_delete ON public.contact_messages
  FOR DELETE
  USING (public.current_user_admin_write_allowed());

CREATE POLICY contact_attachments_admin_read ON public.contact_attachments
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY contact_attachments_admin_delete ON public.contact_attachments
  FOR DELETE
  USING (public.current_user_admin_write_allowed());

REVOKE ALL ON public.contact_messages FROM anon;
REVOKE ALL ON public.contact_attachments FROM anon;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT SELECT, DELETE ON public.contact_attachments TO authenticated;
