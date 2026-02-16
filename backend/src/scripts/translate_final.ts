import pool from '../config/database';

async function finalCleanup() {
    console.log('Starting final modular cleanup...');

    const components: { [key: string]: string } = {
        'מרחק מרכז הכובד מהחרטום': 'Distance from Nose (Center of Gravity)',
        'מומנט אינרציה רוחבי': 'Lateral Moment of Inertia',
        'מומנט אינרציה צירי': 'Axial Moment of Inertia',
        'משקל': 'Weight',
        'גוף חודר': 'RV',
        'יחידת הנעה': 'Booster',
        'שלב 1': 'Stage 1',
        'שלב 2': 'Stage 2',
        'שלב 3': 'Stage 3',
        'אורך כללי': 'Total Length',
        'קוטר(יחוס)': 'Reference Diameter',
        'משקל בהמראה': 'Launch Weight',
        'משקל רש"ק': 'Payload Weight',
        'טווח מקסימום': 'Maximum Range',
        'טווח מינימום': 'Minimum Range',
        'ק"ג': 'kg',
        'מ"מ': 'mm',
        'ק"מ': 'km',
        'מ\'': 'm',
        'טון': 'ton'
    };

    const tables = ['massmomentandxcg', 'weightandsize', 'aerodynamic', 'missiles', 'missilelaunchassociation'];

    try {
        const connection = await pool.getConnection();

        for (const table of tables) {
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            const textColumns = (columns as any[])
                .filter(col => ['varchar', 'text', 'longtext', 'mediumtext'].some(type => col.Type.includes(type)))
                .map(col => col.Field);

            for (const col of textColumns) {
                const [rows] = await connection.query(`SELECT DISTINCT ${col} FROM ${table} WHERE ${col} REGEXP '[\\u0590-\\u05FF]'`);
                const items = rows as any[];

                for (const item of items) {
                    const originalValue = item[col];
                    if (!originalValue) continue;

                    let newValue = originalValue;
                    // Iteratively replace components
                    // Sort components by length descending to replace longest matches first
                    const sortedHe = Object.keys(components).sort((a, b) => b.length - a.length);

                    for (const he of sortedHe) {
                        const en = components[he];
                        // Use regex for word boundaries or just global replace if safe
                        newValue = newValue.split(he).join(en);
                    }

                    if (newValue !== originalValue) {
                        await connection.query(
                            `UPDATE ${table} SET ${col} = ? WHERE ${col} = ?`,
                            [newValue, originalValue]
                        );
                        console.log(`[${table}.${col}] Fixed: "${originalValue}" -> "${newValue}"`);
                    }
                }
            }
        }

        connection.release();
        console.log('Final cleanup finished.');
    } catch (error) {
        console.error('Final cleanup failed:', error);
    } finally {
        process.exit(0);
    }
}

finalCleanup();
