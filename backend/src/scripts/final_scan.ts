import pool from '../config/database';

async function finalScan() {
    console.log('Final scan for Hebrew strings...');
    const tables = ['engine', 'capability', 'performance', 'rcs'];

    try {
        const connection = await pool.getConnection();

        for (const table of tables) {
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            const textColumns = (columns as any[])
                .filter(col => ['varchar', 'text', 'longtext', 'mediumtext'].some(type => col.Type.includes(type)))
                .map(col => col.Field);

            for (const col of textColumns) {
                const [rows] = await connection.query(`SELECT DISTINCT ${col} FROM ${table} WHERE ${col} REGEXP '[\\u0590-\\u05FF]'`);
                (rows as any[]).forEach(row => {
                    console.log(`[${table}.${col}] ${row[col]}`);
                });
            }
        }

        connection.release();
    } catch (error) {
        console.error('Final scan failed:', error);
    } finally {
        process.exit(0);
    }
}

finalScan();
