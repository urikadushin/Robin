import pool from '../config/database';

async function translateAll() {
    console.log('Starting global robust translation...');

    const translations: { [key: string]: string } = {
        'מרחק מרכז הכובד מהחרטום': 'Distance from Nose (Center of Gravity)',
        'מומנט אינרציה רוחבי': 'Lateral Moment of Inertia',
        'מומנט אינרציה צירי': 'Axial Moment of Inertia',
        'משקל': 'Weight',
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

        // Units
        'ק"ג': 'kg',
        'מ"מ': 'mm',
        'ק"מ': 'km',
        'מ\'': 'm'
    };

    const tables = ['massmomentandxcg', 'weightandsize', 'aerodynamic', 'missiles'];

    try {
        const connection = await pool.getConnection();

        for (const table of tables) {
            console.log(`Processing table: ${table}`);
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            const textColumns = (columns as any[])
                .filter(col => ['varchar', 'text', 'longtext', 'mediumtext'].some(type => col.Type.includes(type)))
                .map(col => col.Field);

            for (const col of textColumns) {
                for (const [hebrew, english] of Object.entries(translations)) {
                    // Using TRIM and potentially HEX comparison if still failing
                    const [result] = await connection.query(
                        `UPDATE ${table} SET ${col} = ? WHERE TRIM(${col}) = ? OR ${col} LIKE ?`,
                        [english, hebrew, `%${hebrew}%`]
                    );
                    const affectedRows = (result as any).affectedRows;
                    if (affectedRows > 0) {
                        console.log(`[${table}.${col}] Translated "${hebrew}" -> "${english}" (${affectedRows} rows)`);
                    }
                }
            }
        }

        connection.release();
        console.log('Robust translation completed.');
    } catch (error) {
        console.error('Translation failed:', error);
    } finally {
        process.exit(0);
    }
}

translateAll();
