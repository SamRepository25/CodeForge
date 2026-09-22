-- Make guest comment rate limiting atomic and server-only.
-- PostgreSQL transaction-level advisory locks serialize submissions for the same
-- hashed IP, preventing concurrent requests from racing past the limit.
CREATE OR REPLACE FUNCTION public.submit_guest_comment(
  p_post_id uuid,
  p_name text,
  p_email text,
  p_content text,
  p_ip_hash text
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_count integer;
BEGIN
  IF p_name IS NULL OR char_length(trim(p_name)) NOT BETWEEN 1 AND 100
     OR p_email IS NULL OR char_length(trim(p_email)) NOT BETWEEN 3 AND 255
     OR p_content IS NULL OR char_length(trim(p_content)) NOT BETWEEN 1 AND 1000
     OR p_ip_hash IS NULL OR char_length(p_ip_hash) <> 64
  THEN
    RAISE EXCEPTION 'Invalid comment submission';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.posts
    WHERE id = p_post_id AND published = true
  ) THEN
    RAISE EXCEPTION 'Article not found';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_ip_hash));

  SELECT count(*)::integer
  INTO v_count
  FROM public.guest_comments
  WHERE ip_hash = p_ip_hash
    AND created_at >= now() - interval '1 hour';

  IF v_count >= 3 THEN
    RAISE EXCEPTION 'Comment rate limit exceeded';
  END IF;

  INSERT INTO public.guest_comments (post_id, name, email, content, ip_hash, approved)
  VALUES (p_post_id, trim(p_name), trim(p_email), trim(p_content), p_ip_hash, false)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_guest_comment(uuid, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_guest_comment(uuid, text, text, text, text)
  TO service_role;
