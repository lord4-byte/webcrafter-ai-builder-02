-- Add selected_models column to user_settings table
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS selected_models JSONB DEFAULT '{}'::jsonb;