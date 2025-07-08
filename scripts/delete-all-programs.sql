-- Delete all programs and related data
-- This will cascade delete program_tags relationships

-- First, delete all program_tags relationships
DELETE FROM program_tags;

-- Then delete all programs
DELETE FROM programs;

-- Reset the auto-increment counter (optional)
ALTER SEQUENCE programs_id_seq RESTART WITH 1;

-- Verify deletion
SELECT COUNT(*) as remaining_programs FROM programs;
SELECT COUNT(*) as remaining_program_tags FROM program_tags;

-- Show confirmation message
SELECT 'All programs have been successfully deleted!' as status;
