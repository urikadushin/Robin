import pool from '../config/database';

async function translateMassProps() {
    console.log('Starting mass properties translation...');

    const translations: { [key: string]: string } = {
        'מרחק מרכז הכובד מהחרטום שלב 1': 'Center of Gravity Stage 1 (Nose Ref)',
        'מרחק מרכז הכובד מהחרטום שלב 2': 'Center of Gravity Stage 2 (Nose Ref)',
        'מרחק מרכז הכובד מהחרטום שלב 3': 'Center of Gravity Stage 3 (Nose Ref)',
        'מומנט אינרציה רוחבי שלב 2': 'Transverse Moment of Inertia Stage 2',
        'מומנט אינרציה צירי שלב 2': 'Axial Moment of Inertia Stage 2',
        'משקל שלב 3': 'Stage 3 Weight',
        'משקל שלב 2': 'Stage 2 Weight',
        'משקל שלב 1': 'Stage 1 Weight',
        'מרכז כובד שלב 2': 'Center of Gravity Stage 2',
        'מרכז כובד שלב 1': 'Center of Gravity Stage 1',
        'מרכז כובד שלב 3': 'Center of Gravity Stage 3',
        'מומנט אינרציה רוחבי שלב 1': 'Transverse Moment of Inertia Stage 1',
        'מומנט אינרציה צירי שלב 1': 'Axial Moment of Inertia Stage 1',
        'מומנט אינרציה רוחבי שלב 3': 'Transverse Moment of Inertia Stage 3',
        'מומנט אינרציה צירי שלב 3': 'Axial Moment of Inertia Stage 3',
        'משקל': 'Weight',
        'שלב 1': 'Stage 1',
        'שלב 2': 'Stage 2',
        'שלב 3': 'Stage 3'
    };

    try {
        const connection = await pool.getConnection();

        for (const [hebrew, english] of Object.entries(translations)) {
            const [result] = await connection.query(
                'UPDATE massmomentandxcg SET description = ? WHERE description = ?',
                [english, hebrew]
            );
            const affectedRows = (result as any).affectedRows;
            if (affectedRows > 0) {
                console.log(`Translated "${hebrew}" -> "${english}" (${affectedRows} rows)`);
            }
        }

        // Also check if some descriptions contain these words and replace partials if necessary
        // But for Aluma data, they are usually exact matches.

        connection.release();
        console.log('Translation completed successfully.');
    } catch (error) {
        console.error('Translation failed:', error);
    } finally {
        process.exit(0);
    }
}

translateMassProps();
