import pool from '../config/database';

async function refineNaming() {
    console.log('Refining missile naming and capitalization...');
    try {
        const connection = await pool.getConnection();

        // 1. Capitalize all names and specific Shahed 136 rename
        await connection.query("UPDATE missiles SET name = 'Bulava' WHERE name = 'blava'");
        await connection.query("UPDATE missiles SET name = 'Emad' WHERE name = 'emad'");
        await connection.query("UPDATE missiles SET name = 'Hajqasem' WHERE name = 'hajqasem'");
        await connection.query("UPDATE missiles SET name = 'Shahed 136' WHERE name = 'shahed'");

        const [rows] = await connection.query("SELECT name, type FROM missiles");
        console.log('Updated names:', rows);

        connection.release();
    } catch (error) {
        console.error('Failed:', error);
    } finally {
        process.exit(0);
    }
}

refineNaming();
