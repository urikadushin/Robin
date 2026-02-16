import pool from '../config/database';

async function dumpHexSpecific() {
    console.log('Dumping hex for stubborn strings...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT description, HEX(description) as hex_desc FROM massmomentandxcg WHERE description REGEXP '[\\u0590-\\u05FF]'`);
        (rows as any[]).forEach(row => {
            console.log(`[Stubborn] ${row.description} | [Hex] ${row.hex_desc}`);
        });

        connection.release();
    } catch (error) {
        console.error('Dump failed:', error);
    } finally {
        process.exit(0);
    }
}

dumpHexSpecific();
