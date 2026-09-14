-- Private bucket for contact form attachments.
--
-- Security model:
-- - Bucket is private (public = false). Files are never served by a public URL.
-- - No INSERT/UPDATE policy exists for anon/authenticated: only the
--   service-role server function uploads files (bypasses storage RLS).
-- - SELECT is admin-only. Attachments are fetched via short-lived signed
--   URLs generated client-side (browser calls createSignedUrl using the
--   admin's own authenticated session), which Supabase Storage checks
--   against this SELECT policy before issuing the URL.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-attachments',
  'contact-attachments',
  false,
  8388608, -- 8 MB per object, matching the product limit enforced client- and server-side
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY contact_attachments_bucket_admin_read ON storage.objects
  FOR SELECT
  USING (bucket_id = 'contact-attachments' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY contact_attachments_bucket_admin_delete ON storage.objects
  FOR DELETE
  USING (bucket_id = 'contact-attachments' AND public.current_user_admin_write_allowed());
