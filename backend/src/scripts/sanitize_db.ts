import pool from '../config/database';

async function sanitizeAll() {
    console.log('Starting global Hebrew sanitization and classification updates...');
    try {
        const connection = await pool.getConnection();

        // 1. Update Shahed-136 type
        await connection.query(
            "UPDATE missiles SET type = 'Kamikaze Drone' WHERE name LIKE '%Shahed%' OR name LIKE '%שאיהד%'"
        );
        console.log('Updated Shahed classification to Kamikaze Drone.');

        // 2. Sanitize all text columns in key tables
        const tables = ['missiles', 'weightandsize', 'aerodynamic', 'images'];
        const hebrewRegex = /[\\u0590-\\u05FF]/;

        for (const table of tables) {
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            const textColumns = (columns as any[])
                .filter(col => ['varchar', 'text', 'longtext', 'mediumtext'].some(type => col.Type.includes(type)))
                .map(col => col.Field);

            for (const col of textColumns) {
                const [rows] = await connection.query(`SELECT id${table === 'missiles' ? '' : table === 'images' ? 'images' : 'id'} as id_val, ${col} FROM ${table}`);
                // Note: The ID column naming is inconsistent in this DB, but this hack covers most.
                // Better approach: use the first column as ID if it's auto-increment or primary.
                const idCol = (columns as any[])[0].Field;

                const [allRows] = await connection.query(`SELECT ${idCol}, ${col} FROM ${table}`);

                for (const row of (allRows as any[])) {
                    const originalValue = row[col];
                    if (originalValue && hebrewRegex.test(originalValue)) {
                        let newValue = originalValue;
                        // For descriptions in images, use the generator as fallback
                        if (table === 'images' && col === 'image_description') {
                            const [imgData] = await connection.query(`SELECT missile_name, image_type FROM images WHERE ${idCol} = ?`, [row[idCol]]);
                            const idata = (imgData as any)[0];
                            newValue = `${idata.missile_name || 'Threat'} ${idata.image_type || 'Detail'}`;
                        } else {
                            // Simple removal/English fallback if mapping doesn't exist
                            // This is a broad brush for anything missed by specific scripts
                            newValue = originalValue.replace(/[\\u0590-\\u05FF]/g, '').trim();
                            if (!newValue) newValue = 'N/A';
                        }

                        await connection.query(
                            `UPDATE ${table} SET ${col} = ? WHERE ${idCol} = ?`,
                            [newValue, row[idCol]]
                        );
                        console.log(`[${table}.${col}] Sanitized ID ${row[idCol]}`);
                    }
                }
            }
        }

        connection.release();
        console.log('Global sanitization finished.');
    } catch (error) {
        console.error('Sanitization failed:', error);
    } finally {
        process.exit(0);
    }
}

sanitizeAll();
