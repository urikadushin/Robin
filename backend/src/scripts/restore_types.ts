import pool from '../config/database';

async function restoreTypes() {
    console.log('Restoring correct missile types...');
    try {
        const connection = await pool.getConnection();

        await connection.query("UPDATE missiles SET type = 'Ballistic Missile' WHERE name IN ('emad', 'blava', 'hajqasem')");
        await connection.query("UPDATE missiles SET type = 'Kamikaze Drone' WHERE name = 'shahed'");

        const [rows] = await connection.query("SELECT name, type FROM missiles");
        console.log('Current types:', rows);

        connection.release();
    } catch (error) {
        console.error('Failed:', error);
    } finally {
        process.exit(0);
    }
}

restoreTypes();
