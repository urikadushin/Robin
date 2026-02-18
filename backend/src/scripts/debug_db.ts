
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function debugDB() {
    try {
        console.log('--- DB Debug ---');
        const [cols]: any = await pool.query("SHOW FULL COLUMNS FROM weightandsize");
        console.log('Columns Detail:', JSON.stringify(cols, null, 2));

        const [triggers]: any = await pool.query("SHOW TRIGGERS");
        console.log('Triggers:', JSON.stringify(triggers, null, 2));

        const [bulavaData]: any = await pool.query("SELECT * FROM weightandsize WHERE missile_id = 4");
        console.log('Bulava Data:', JSON.stringify(bulavaData, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Debug failed:', error);
        process.exit(1);
    }
}

debugDB();
