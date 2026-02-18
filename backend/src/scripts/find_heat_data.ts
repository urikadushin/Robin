
import pool from '../config/database';

async function checkHeatAndRcs() {
    try {
        console.log('--- Checking Heat Signature Images ---');
        const [images] = await pool.query('SELECT * FROM images WHERE image_type LIKE "%heat%" OR image_description LIKE "%heat%" OR part_name LIKE "%heat%"');
        console.log(JSON.stringify(images, null, 2));

        console.log('\n--- Checking RCS Mapping ---');
        const [rcs] = await pool.query('SELECT * FROM rcs LIMIT 5');
        console.log(JSON.stringify(rcs, null, 2));

        console.log('\n--- Checking Performance Runs for Hajqasem ---');
        const [perf] = await pool.query('SELECT * FROM performance WHERE missile_name = "hajqasem"');
        console.log(JSON.stringify(perf, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkHeatAndRcs();
