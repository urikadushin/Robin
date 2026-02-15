
-- Update generic_names for Shahed-136 (Updates don't need IDs)
UPDATE weightandsize SET generic_name = 'maxRange' WHERE missile_id = 6 AND description LIKE '%טווח%';
UPDATE weightandsize SET generic_name = 'launchWeight' WHERE missile_id = 6 AND description LIKE '%משקל%' AND generic_name IS NULL;

-- Update generic_names for Haj Qasem
UPDATE weightandsize SET generic_name = 'maxRange' WHERE missile_id = 7 AND description LIKE '%טווח%';
UPDATE weightandsize SET generic_name = 'launchWeight' WHERE missile_id = 7 AND description LIKE '%משקל%' AND description NOT LIKE '%רש%';

-- Update generic_names for Emad
UPDATE weightandsize SET generic_name = 'launchWeight' WHERE missile_id = 5 AND description LIKE '%משקל בהמראה%';

-- Emad seems to lack range in weightandsize, inserting it
-- Using ID range 10000+
INSERT INTO weightandsize (idweightandsize, missile_id, missile_name, description, generic_name, property_value, unit, subject)
SELECT 10001, 5, 'emad', 'טווח מקסימום', 'maxRange', '1700', 'km', 'general'
WHERE NOT EXISTS (SELECT 1 FROM weightandsize WHERE missile_id = 5 AND generic_name = 'maxRange');

-- Bulava seems to lack range in weightandsize, inserting it
INSERT INTO weightandsize (idweightandsize, missile_id, missile_name, description, generic_name, property_value, unit, subject)
SELECT 10002, 4, 'bulava', 'טווח מקסימום', 'maxRange', '8300', 'km', 'general'
WHERE NOT EXISTS (SELECT 1 FROM weightandsize WHERE missile_id = 4 AND generic_name = 'maxRange');

INSERT INTO weightandsize (idweightandsize, missile_id, missile_name, description, generic_name, property_value, unit, subject)
SELECT 10003, 4, 'bulava', 'משקל בהמראה', 'launchWeight', '36800', 'kg', 'general'
WHERE NOT EXISTS (SELECT 1 FROM weightandsize WHERE missile_id = 4 AND generic_name = 'launchWeight');

-- Update typo in missile name for Shahed
UPDATE weightandsize SET missile_name = 'shahed136' WHERE missile_name = 'shaheb136';
