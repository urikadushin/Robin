
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkOrigins() {
    console.log('--- Checking Origins vs Family Types ---');
    try {
        const [ws]: any = await pool.query("SELECT missile_id, missile_name, property_value FROM weightandsize WHERE generic_name = 'origin'");
        console.log('WeightAndSize Origins:', JSON.stringify(ws, null, 2));

        const [ms]: any = await pool.query("SELECT id, name, family_type FROM missiles");
        console.log('Missiles Family Types:', JSON.stringify(ms, null, 2));

        process.exit(0);
    } catch (error: any) {
        console.error('Check failed:', error.message);
        process.exit(1);
    }
}

checkOrigins();
