import pool from '../config/database';

async function listMissiles() {
    console.log('Listing missile names and families...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT name, family_type FROM missiles`);
        (rows as any[]).forEach(row => {
            console.log(`[Missile] Name: ${row.name} | Family: ${row.family_type}`);
        });

        connection.release();
    } catch (error) {
        console.error('List failed:', error);
    } finally {
        process.exit(0);
    }
}

listMissiles();
