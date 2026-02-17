
import pool from '../config/database';

async function checkThermalImages() {
    try {
        const [rows] = await pool.query('SELECT * FROM images WHERE image_type = "thermal"');
        console.log('Current Thermal Images in DB:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkThermalImages();
