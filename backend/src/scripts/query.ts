
import pool from '../config/database';

async function runQuery() {
    const query = process.argv[2] || 'SHOW TABLES';
    try {
        const [rows] = await pool.query(query);
        console.log('Query Result:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Query Failed:', error);
        process.exit(1);
    }
}
runQuery();
