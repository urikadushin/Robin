
import pool from '../config/database';

async function listHajqasemImages() {
    try {
        const [rows] = await pool.query('SELECT * FROM images WHERE missile_name = "hajqasem"');
        console.log('Hajqasem Images:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

listHajqasemImages();
