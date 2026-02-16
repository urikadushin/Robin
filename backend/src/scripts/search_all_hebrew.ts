import pool from '../config/database';

async function searchAllTables() {
    console.log('Searching all tables for Hebrew strings...');
    try {
        const connection = await pool.getConnection();
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = (tables as any[]).map(t => Object.values(t)[0] as string);

        for (const tableName of tableNames) {
            const [columns] = await connection.query(`DESCRIBE ${tableName}`);
            const textColumns = (columns as any[]).filter(c =>
                c.Type.includes('char') || c.Type.includes('text')
            ).map(c => c.Field);

            for (const col of textColumns) {
                const [rows] = await connection.query(`SELECT ${col} FROM ${tableName} WHERE ${col} REGEXP '[\\u0590-\\u05FF]'`);
                if ((rows as any[]).length > 0) {
                    console.log(`[Found] Table: ${tableName}, Column: ${col}`);
                    (rows as any[]).forEach(row => {
                        console.log(`   -> ${row[col]}`);
                    });
                }
            }
        }

        connection.release();
    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        process.exit(0);
    }
}

searchAllTables();
