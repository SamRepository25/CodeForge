# CodeForge Admin Control Center

The authenticated `/admin` area provides the private administration surface for CodeForge.

## Current areas

- Dashboard and operational overview
- Contact messages and private attachment handling
- Blog management
- Project management
- Education and experience management
- Website settings
- Public media library
- Security
- Audit / activity
- Analytics
- Comment moderation
- Engagement
- Bookmarks privacy handling
- Global search
- System health
- CSV export
- Trash / recovery
- Admin profile

## Security model

Administrative access is protected by the authenticated route guard and the Supabase `user_roles` admin role. Contact attachments use a separate private storage bucket and signed URLs. Public website media uses the `site-media` bucket. The repository also contains an immutable `admin_audit_log` migration and client helper protected by Row Level Security.

## Production note

The production build must be verified with `npm run build` before a release is considered ready. Formatting-only Prettier changes should not be mixed into production bug fixes unless required by the build or lint configuration.
