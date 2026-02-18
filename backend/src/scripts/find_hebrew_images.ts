import pool from '../config/database';

async function findHebrewImages() {
    console.log('Finding Hebrew descriptions in images table...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT image_description FROM images WHERE image_description REGEXP '[\\u0590-\\u05FF]'`);
        console.log('Unique Hebrew descriptions:');
        const unique = new Set((rows as any[]).map(r => r.image_description));
        unique.forEach(desc => console.log(`- ${desc}`));

        connection.release();
    } catch (error) {
        console.error('Failed:', error);
    } finally {
        process.exit(0);
    }
}

findHebrewImages();
