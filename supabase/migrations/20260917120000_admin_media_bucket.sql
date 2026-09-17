-- CodeForge admin media library: public website assets, admin-managed writes.
-- Public reads are intentional for media used by the portfolio/blog.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can list site media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'site-media'
  and public.has_role(auth.uid(), 'admin')
);

create policy "Admins can upload site media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and public.has_role(auth.uid(), 'admin')
);

create policy "Admins can update site media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and public.has_role(auth.uid(), 'admin')
)
with check (
  bucket_id = 'site-media'
  and public.has_role(auth.uid(), 'admin')
);

create policy "Admins can delete site media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and public.has_role(auth.uid(), 'admin')
);