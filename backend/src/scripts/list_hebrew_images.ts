import pool from '../config/database';

async function listAllHebrewImages() {
    console.log('Listing all Hebrew descriptions in images table...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT DISTINCT image_description FROM images WHERE image_description REGEXP '[\\u0590-\\u05FF]'`);
        const items = rows as any[];
        console.log(`Found ${items.length} unique Hebrew descriptions:`);
        items.forEach(item => {
            console.log(`HEBREW_START: ${item.image_description} :HEBREW_END`);
        });

        connection.release();
    } catch (error) {
        console.error('Failed:', error);
    } finally {
        process.exit(0);
    }
}

listAllHebrewImages();
