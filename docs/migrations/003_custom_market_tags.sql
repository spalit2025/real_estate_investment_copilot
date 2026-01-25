-- Migration: Allow custom market tags
-- Date: 2026-01-24
-- Description: Remove the check constraint on market_tag to allow custom tags

-- Drop the existing check constraint
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_market_tag_check;

-- Add an index on market_tag for faster filtering
CREATE INDEX IF NOT EXISTS deals_market_tag_idx ON deals(market_tag);

-- Note: No check constraint added - any string value is now allowed for market_tag
-- Preset tags are: bay_area_appreciation, cash_flow_market, midwest_value,
--                  sunbelt_growth, coastal_premium, college_town, vacation_rental
-- Users can also create custom tags
