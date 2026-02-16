import pool from '../config/database';

async function dumpHex() {
    console.log('Dumping hex values for massmomentandxcg...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT DISTINCT description, HEX(description) as hex_desc FROM massmomentandxcg`);
        (rows as any[]).forEach(row => {
            console.log(`[Raw] ${row.description} | [Hex] ${row.hex_desc}`);
        });

        connection.release();
    } catch (error) {
        console.error('Dump failed:', error);
    } finally {
        process.exit(0);
    }
}

dumpHex();
