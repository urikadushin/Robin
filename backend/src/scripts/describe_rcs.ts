import pool from '../config/database';

async function describeRcs() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`DESCRIBE rcs`);
        console.log(JSON.stringify(rows, null, 2));
        connection.release();
    } catch (error) {
        console.error('Describe failed:', error);
    } finally {
        process.exit(0);
    }
}

describeRcs();
