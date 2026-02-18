
import pool from '../config/database';

async function listAllImageTypes() {
    try {
        const [rows] = await pool.query('SELECT DISTINCT image_type FROM images');
        console.log('Image Types:', rows);

        const [descriptions] = await pool.query('SELECT part_name, image_description FROM images LIMIT 50');
        console.log('Sample Descriptions:', descriptions);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

listAllImageTypes();
