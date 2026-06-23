# Migrate CodeForge from Lovable Cloud → Your Own Supabase

This guide moves the backend (schema, RLS, auth trigger, functions) to a Supabase project you own. After this, the app will run identically against your project.

---

## 1. What you need from your new Supabase project

From **Project Settings → API**:

- Project URL: `https://<your-ref>.supabase.co`
- `anon` / publishable key
- `service_role` key (keep server-side only)

---

## 2. Run the schema migration

Open **SQL Editor** in your new Supabase project and run `supabase/migrations/0001_codeforge_init.sql` (file included in this repo) in one shot. It creates:

- `app_role` enum (`admin`, `user`)
- Tables: `profiles`, `user_roles`, `posts`, `projects`, `comments`, `likes`, `bookmarks`
- `GRANT`s for `anon` / `authenticated` / `service_role`
- RLS enabled + all policies
- Functions: `has_role`, `handle_new_user`, `tg_set_updated_at`, `get_post_like_count`
- Trigger `on_auth_user_created` on `auth.users` (auto-creates profile + default `user` role on signup)
- `updated_at` triggers on `posts` and `projects`

No storage buckets are used by the app today, so none are created. If you later add file uploads, create a bucket via Storage UI and add policies on `storage.objects`.

---

## 3. Export & import your existing data

In the current Lovable Cloud project, go to **Cloud → Database → Tables** and export each table as CSV (only full-DB dumps are restricted; per-table CSV is supported).

Import order matters (FK dependencies):

1. `profiles` (one row per auth user — see step 4 first)
2. `user_roles`
3. `posts`
4. `projects`
5. `comments`
6. `likes`
7. `bookmarks`

In your new Supabase: **Table Editor → table → Insert → Import data from CSV**.

---

## 4. Migrate users (auth.users)

Supabase doesn't expose a one-click user export, but you have two clean options:

**Option A — Have users sign up again** (simplest). Profile rows will be auto-created by the trigger; you'll need to manually re-link old `author_id` values if you want to keep authored posts.

**Option B — Use the Admin API to recreate users with the same UUIDs**, then import `profiles` / `user_roles` / `posts` etc. with their original IDs. Sketch:

```bash
# For each old user:
curl -X POST "https://<your-ref>.supabase.co/auth/v1/admin/users" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"id":"<old-uuid>","email":"<email>","email_confirm":true,"password":"<temp>"}'
```

Then ask users to reset their password from the login page. The `handle_new_user` trigger will auto-create missing `profiles` / `user_roles`. If you imported those rows first, the trigger's `ON CONFLICT DO NOTHING` keeps your data intact.

---

## 5. Authentication configuration

In **Authentication → Providers** of your new project:

- **Email** — enabled. Decide on "Confirm email" (recommended ON for production).
- **Google** — enable, paste your Google OAuth client ID + secret. Callback URL Supabase shows you must be added to Google Cloud Console → Credentials → Authorized redirect URIs.
- **Leaked password protection (HIBP)** — enable in Authentication → Policies for safety.

In **Authentication → URL Configuration**:

- **Site URL**: `https://https://codeforgedev.vercel.app` (or your custom domain)
- **Redirect URLs**: add both
  - `https://https://codeforgedev.vercel.app/**`
  - `http://localhost:8080/**` (for local dev)

---

## 6. Environment variables (in this Lovable project)

Replace the Cloud-managed values with your own. The codebase reads:

| Variable | Where | Value |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` (client) | `https://<your-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` (client) | your `anon` key |
| `VITE_SUPABASE_PROJECT_ID` | `.env` (client) | `<your-ref>` |
| `SUPABASE_URL` | server secret | same URL |
| `SUPABASE_PUBLISHABLE_KEY` | server secret | same anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server secret | your service role key |
| `SUPABASE_DB_URL` | server secret (optional) | from Project Settings → Database → Connection string |

> Note: while this project still has Lovable Cloud attached, `src/integrations/supabase/client.ts` is auto-generated and these env vars are overwritten on each build. To fully switch off Cloud you'll need to either (a) disconnect Cloud in Connectors (this only stops it being added to **future** projects — it can't be removed from this one), or (b) fork/export the codebase, point the integration files at your own keys, and host it outside Lovable. There's no in-product way to swap the backend of an existing Cloud project to a self-managed Supabase.

---

## 7. Verify

After migration:

- Sign up a fresh user → confirm a row appears in both `profiles` and `user_roles`.
- Publish a post → verify it shows on `/blog` for anonymous visitors.
- Like / bookmark / comment as an authed user → verify RLS allows your own rows only.
- Promote yourself to admin: `INSERT INTO user_roles (user_id, role) VALUES ('<your-uid>', 'admin') ON CONFLICT DO NOTHING;`
