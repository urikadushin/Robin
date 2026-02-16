import pool from '../config/database';

async function finalMissionFix() {
    console.log('--- STARTING FINAL MISSION FIX ---');
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. FIX TRAJECTORY PATHS
        console.log('1. Fixing Trajectory Paths...');
        const [perfRows] = await connection.query(`SELECT perfIndex, missile_name, trajectoryRvPath, trajectoryBtPath FROM performance`);
        for (const row of perfRows as any[]) {
            const updates: string[] = [];
            const params: any[] = [];

            if (row.trajectoryRvPath && !row.trajectoryRvPath.includes('/')) {
                const newPath = `${row.missile_name}/${row.trajectoryRvPath}`;
                updates.push('trajectoryRvPath = ?');
                params.push(newPath);
            }
            if (row.trajectoryBtPath && !row.trajectoryBtPath.includes('/')) {
                const newPath = `${row.missile_name}/${row.trajectoryBtPath}`;
                updates.push('trajectoryBtPath = ?');
                params.push(newPath);
            }

            if (updates.length > 0) {
                params.push(row.perfIndex);
                await connection.query(`UPDATE performance SET ${updates.join(', ')} WHERE perfIndex = ?`, params);
                console.log(`   [Performance] Updated paths for Run #${row.perfIndex} (${row.missile_name})`);
            }
        }

        // 2. FINAL HEBREW LOCALIZATION
        console.log('2. Final Hebrew Localization Sweep...');
        const components: { [key: string]: string } = {
            'מרחק מרכז הכובד מהחרטום': 'Distance from Nose (Center of Gravity)',
            'מומנט אינרציה רוחבי': 'Lateral Moment of Inertia',
            'מומנט אינרציה צירי': 'Axial Moment of Inertia',
            'משקל': 'Weight',
            'גוף חודר': 'RV',
            'יחידת הנעה': 'Booster',
            'מיקום מרכז כובד': 'Center of Gravity position',
            'שלב': 'Stage',
            'גוף': 'Body',
            'חרטום': 'Nose',
            'מנוע': 'Motor',
            'דלק': 'Propellant',
            'מטען ייעודי': 'Payload',
            'מעטפת': 'Envelope',
            'סנפיר': 'Fin',
            'הנחיה': 'Guidance',
            'הגה': 'Control Surface',
            'ייצוב': 'Stabilizer',
            'אורך': 'Length',
            'קוטר': 'Diameter',
            'נפח': 'Volume',
            'שטח': 'Area'
        };

        const tables = ['massmomentandxcg', 'weightandsize', 'aerodynamic', 'engine', 'capability', 'performance', 'rcs', 'missiles', 'missilelaunchassociation'];
        const sortedHe = Object.keys(components).sort((a, b) => b.length - a.length);

        for (const table of tables) {
            const [columns] = await connection.query(`DESCRIBE ${table}`);
            const textCols = (columns as any[]).filter(c => c.Type.includes('char') || c.Type.includes('text')).map(c => c.Field);

            for (const col of textCols) {
                const [rows] = await connection.query(`SELECT * FROM ${table} WHERE ${col} REGEXP '[\\u0590-\\u05FF]'`);
                for (const row of rows as any[]) {
                    let newValue = row[col];
                    const idCol = (columns as any[]).find(c => c.Key === 'PRI')?.Field || Object.keys(row)[0];

                    for (const he of sortedHe) {
                        const en = components[he];
                        newValue = newValue.split(he).join(en);
                    }

                    if (newValue !== row[col]) {
                        await connection.query(`UPDATE ${table} SET ${col} = ? WHERE ${idCol} = ?`, [newValue, row[idCol]]);
                        console.log(`   [${table}.${col}] Fixed: "${row[col]}" -> "${newValue}"`);
                    }
                }
            }
        }

        await connection.commit();
        console.log('--- FINAL MISSION FIX COMPLETED SUCCESSFULLY ---');
    } catch (error) {
        await connection.rollback();
        console.error('--- FINAL MISSION FIX FAILED ---', error);
    } finally {
        connection.release();
        process.exit(0);
    }
}

finalMissionFix();
