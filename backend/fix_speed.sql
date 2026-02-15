
-- Insert Speed Data for Bulava (Approx 7000 m/s)
INSERT INTO weightandsize (idweightandsize, missile_id, missile_name, description, generic_name, property_value, unit, subject)
SELECT 11001, 4, 'bulava', 'Speed', 'speed', '7000', 'm/s', 'general'
WHERE NOT EXISTS (SELECT 1 FROM weightandsize WHERE missile_id = 4 AND generic_name = 'speed');

-- Insert Speed Data for Emad (Approx 4000 m/s)
INSERT INTO weightandsize (idweightandsize, missile_id, missile_name, description, generic_name, property_value, unit, subject)
SELECT 11002, 5, 'emad', 'Speed', 'speed', '4000', 'm/s', 'general'
WHERE NOT EXISTS (SELECT 1 FROM weightandsize WHERE missile_id = 5 AND generic_name = 'speed');

-- Insert Speed Data for Shahed-136 (Approx 50 m/s)
INSERT INTO weightandsize (idweightandsize, missile_id, missile_name, description, generic_name, property_value, unit, subject)
SELECT 11003, 6, 'shahed136', 'Speed', 'speed', '50', 'm/s', 'general'
WHERE NOT EXISTS (SELECT 1 FROM weightandsize WHERE missile_id = 6 AND generic_name = 'speed');

-- Insert Speed Data for Haj Qasem (Approx 4000 m/s)
INSERT INTO weightandsize (idweightandsize, missile_id, missile_name, description, generic_name, property_value, unit, subject)
SELECT 11004, 7, 'hajqasem', 'Speed', 'speed', '4000', 'm/s', 'general'
WHERE NOT EXISTS (SELECT 1 FROM weightandsize WHERE missile_id = 7 AND generic_name = 'speed');
