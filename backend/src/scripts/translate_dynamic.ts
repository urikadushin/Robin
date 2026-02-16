import pool from '../config/database';

async function dynamicTranslate() {
    console.log('Starting dynamic global translation...');

    const mapping: { [key: string]: string } = {
        'מרחק מרכז הכובד מהחרטום': 'Distance from Nose (Center of Gravity)',
        'מומנט אינרציה רוחבי': 'Lateral Moment of Inertia',
        'מומנט אינרציה צירי': 'Axial Moment of Inertia',
        'משקל': 'Weight',
        'שלב 1': 'Stage 1',
        'שלב 2': 'Stage 2',
        'שלב 3': 'Stage 3',
        'משקל גוף חודר': 'RV Weight',
        'מרחק מרכז הכובד מהחרטום גוף חודר': 'RV Center of Gravity (Nose Ref)',
        'מומנט אינרציה רוחבי גוף חודר': 'RV Lateral Moment of Inertia',
        'מומנט אינרציה צירי גוף חודר': 'RV Axial Moment of Inertia',
        'משקל יחידת הנעה': 'Booster Weight',
        'מרחק מרכז הכובד מהחרטום יחידת הנעה': 'Booster Center of Gravity (Nose Ref)',
        'מומנט אינרציה רוחבי יחידת הנעה': 'Booster Lateral Moment of Inertia',
        'מומנט אינרציה צירי יחידת הנעה': 'Booster Axial Moment of Inertia',
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
                // Find all unique values in this column that contain Hebrew
                const [rows] = await connection.query(`SELECT DISTINCT ${col} FROM ${table} WHERE ${col} REGEXP '[\\u0590-\\u05FF]'`);
                const items = rows as any[];

                for (const item of items) {
                    const originalValue = item[col];
                    if (!originalValue) continue;

                    let newValue = originalValue;
                    // Try to replace based on our mapping
                    for (const [hebrew, english] of Object.entries(mapping)) {
                        if (newValue.includes(hebrew)) {
                            newValue = newValue.replace(hebrew, english);
                        }
                    }

                    if (newValue !== originalValue) {
                        // Update the database using the exact original string (no trim/like guess)
                        const [updateResult] = await connection.query(
                            `UPDATE ${table} SET ${col} = ? WHERE ${col} = ?`,
                            [newValue, originalValue]
                        );
                        console.log(`[${table}.${col}] Updated "${originalValue}" -> "${newValue}" (${(updateResult as any).affectedRows} rows)`);
                    } else {
                        console.warn(`[${table}.${col}] No mapping found for Hebrew string: "${originalValue}"`);
                    }
                }
            }
        }

        connection.release();
        console.log('Dynamic translation finished.');
    } catch (error) {
        console.error('Dynamic translation failed:', error);
    } finally {
        process.exit(0);
    }
}

dynamicTranslate();
