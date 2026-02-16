import pool from '../config/database';

async function findWS() {
    console.log('Finding Hebrew in weightandsize...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT DISTINCT description FROM weightandsize WHERE description REGEXP '[\\u0590-\\u05FF]'`);
        (rows as any[]).forEach(row => {
            console.log(`[WS] ${row.description}`);
        });

        const [rows2] = await connection.query(`SELECT DISTINCT subject FROM weightandsize WHERE subject REGEXP '[\\u0590-\\u05FF]'`);
        (rows2 as any[]).forEach(row => {
            console.log(`[WS Subject] ${row.subject}`);
        });

        connection.release();
    } catch (error) {
        console.error('Scan failed:', error);
    } finally {
        process.exit(0);
    }
}

findWS();
