-- Add missing columns to service table
ALTER TABLE service ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE service ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER;

-- Add missing columns to task table for time tracking
ALTER TABLE task ADD COLUMN IF NOT EXISTS service_name VARCHAR(200);
ALTER TABLE task ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE task ADD COLUMN IF NOT EXISTS stopped_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE task ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

-- Update some sample services with descriptions
UPDATE service SET description = 'Hem pants to desired length' WHERE name ILIKE '%hem%';
UPDATE service SET description = 'Take in waist for better fit' WHERE name ILIKE '%waist%';
UPDATE service SET description = 'Shorten sleeves to proper length' WHERE name ILIKE '%sleeve%';
UPDATE service SET description = 'Let out seams for more room' WHERE name ILIKE '%let out%';
UPDATE service SET description = 'Repair zipper functionality' WHERE name ILIKE '%zipper%';

-- Set estimated minutes for common services
UPDATE service SET estimated_minutes = 30 WHERE name ILIKE '%hem%';
UPDATE service SET estimated_minutes = 45 WHERE name ILIKE '%waist%';
UPDATE service SET estimated_minutes = 25 WHERE name ILIKE '%sleeve%';
UPDATE service SET estimated_minutes = 60 WHERE name ILIKE '%let out%';
UPDATE service SET estimated_minutes = 90 WHERE name ILIKE '%zipper%';
