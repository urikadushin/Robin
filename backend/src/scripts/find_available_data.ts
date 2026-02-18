
import pool from '../config/database';

async function findAvailableData() {
    try {
        console.log('--- Threats with thermal data ---');
        const [thermal] = await pool.query('SELECT DISTINCT missile_name FROM images WHERE image_type = "thermal"');
        console.log('Threats with thermal:', thermal);

        console.log('\n--- Threats with RCS metadata ---');
        const [rcs] = await pool.query('SELECT DISTINCT p.missile_name FROM performance p JOIN rcs r ON p.perfIndex = r.perf_id');
        console.log('Threats with RCS:', rcs);

        console.log('\n--- Sample Thermal Images ---');
        const [thermalImages] = await pool.query('SELECT * FROM images WHERE image_type = "thermal" LIMIT 10');
        console.log('Thermal Images:', thermalImages);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

findAvailableData();
