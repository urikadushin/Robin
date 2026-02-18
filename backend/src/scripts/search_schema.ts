
import pool from '../config/database';

async function searchSchema() {
    try {
        console.log('--- Searching for "heat" in Tables/Columns ---');
        const [columns] = await pool.query('SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE "%heat%" OR TABLE_NAME LIKE "%heat%" OR COLUMN_NAME LIKE "%ir%" OR TABLE_NAME LIKE "%ir%"');
        console.log('Matches:', columns);

        console.log('\n--- Checking RCS entries for Hajqasem (perf_id 24) ---');
        const [rcs] = await pool.query('SELECT * FROM rcs WHERE perf_id = 24');
        console.log('RCS for Hajqasem:', rcs);

        console.log('\n--- Checking all image types ---');
        const [types] = await pool.query('SELECT DISTINCT image_type FROM images');
        console.log('Image Types:', types);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

searchSchema();
