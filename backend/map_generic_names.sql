
-- Map Hebrew descriptions to generic names for consistency in threatMapper
UPDATE weightandsize SET generic_name = 'totalLength' WHERE (description LIKE '%אורך כללי%' OR description LIKE '%אורך מקטע החרטום%') AND generic_name IS NULL;
UPDATE weightandsize SET generic_name = 'd' WHERE (description LIKE '%קוטר ייחוס%' OR description LIKE '%קוטר מירבי%' OR description LIKE '% קוטר%') AND generic_name IS NULL;
UPDATE weightandsize SET generic_name = 'launchWeight' WHERE (description LIKE '%משקל שיגור%' OR description LIKE '%משקל המראה%' OR description LIKE '% משקל%') AND generic_name IS NULL;
UPDATE weightandsize SET generic_name = 'wh_weight' WHERE (description LIKE '%משקל רש"ק%' OR description LIKE '%משקל רשק%') AND generic_name IS NULL;
UPDATE weightandsize SET generic_name = 'maxRange' WHERE (description LIKE '%טווח מקסימום%' OR description LIKE '%טווח מירבי%') AND generic_name IS NULL;
UPDATE weightandsize SET generic_name = 'minRange' WHERE description LIKE '%טווח מינימום%' AND generic_name IS NULL;
