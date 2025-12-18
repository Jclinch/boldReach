-- Password Reset Tokens Table
-- Run this in Supabase SQL editor to add custom password reset flow

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens (token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens (user_id);

-- RLS policies
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage tokens (server-side operations)
-- This is handled via server-side API routes with service role key

-- Optional: Allow users to see their own tokens (if you want to display in UI)
CREATE POLICY "users_view_own_tokens" ON public.password_reset_tokens
  FOR SELECT USING (auth.uid() = user_id);
