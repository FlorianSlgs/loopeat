-- Migration: Add batch_id to users_boxes table
-- Date: 2025-10-29
-- Description: Add batch_id column to group multiple box types in a single proposal

-- Add batch_id column (UUID type to group related proposals)
ALTER TABLE public.users_boxes
ADD COLUMN IF NOT EXISTS batch_id uuid;

-- Add accepted column if it doesn't exist (for proposal acceptance tracking)
ALTER TABLE public.users_boxes
ADD COLUMN IF NOT EXISTS accepted boolean;

-- Create index on batch_id for faster queries
CREATE INDEX IF NOT EXISTS idx_users_boxes_batch_id
ON public.users_boxes USING btree (batch_id);

-- Add comment for documentation
COMMENT ON COLUMN public.users_boxes.batch_id IS 'Groups multiple box types from the same proposal together';
COMMENT ON COLUMN public.users_boxes.accepted IS 'NULL=pending, true=accepted, false=rejected';
