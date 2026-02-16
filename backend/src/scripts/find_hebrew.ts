import pool from '../config/database';

async function findHebrew() {
    console.log('Finding all unique Hebrew strings...');
    const tables = [
        'missiles',
        'weightandsize',
        'aerodynamic',
        'engine',
        'capability',
        'performance',
        'rcs',
        'massmomentandxcg'
    ];

    try {
        const connection = await pool.getConnection();

        for (const table of tables) {
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            const textColumns = (columns as any[])
                .filter(col => ['varchar', 'text', 'longtext', 'mediumtext'].some(type => col.Type.includes(type)))
                .map(col => col.Field);

            for (const col of textColumns) {
                // MySQL 8+ regex for Hebrew. For older versions, we might need HEX search.
                // Let's use a broad regex.
                const [rows] = await connection.query(`SELECT DISTINCT ${col} FROM ${table} WHERE ${col} REGEXP '[\\u0590-\\u05FF]'`);
                const items = rows as any[];
                if (items.length > 0) {
                    items.forEach(row => {
                        const val = row[col];
                        if (val && /[\u0590-\u05FF]/.test(val)) {
                            console.log(`[${table}.${col}] ${val}`);
                        }
                    });
                }
            }
        }

        connection.release();
    } catch (error) {
        console.error('Scan failed:', error);
    } finally {
        process.exit(0);
    }
}

findHebrew();
