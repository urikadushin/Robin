import pool from '../config/database';

async function listMassProps() {
    console.log('Listing all descriptions in massmomentandxcg...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT DISTINCT description FROM massmomentandxcg`);
        (rows as any[]).forEach(row => {
            console.log(`[MassProp] ${row.description}`);
        });

        connection.release();
    } catch (error) {
        console.error('List failed:', error);
    } finally {
        process.exit(0);
    }
}

listMassProps();
