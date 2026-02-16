import pool from '../config/database';

async function findLiteralHebrew() {
    const target = 'מרחק מרכז הכובד מהחרטום';
    console.log(`Searching for literal string: "${target}"...`);
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
                const [rows] = await connection.query(`SELECT ${col} FROM ${tableName} WHERE ${col} LIKE ?`, [`%${target}%`]);
                if ((rows as any[]).length > 0) {
                    console.log(`[Literal Match] Table: ${tableName}, Column: ${col}`);
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

findLiteralHebrew();
