
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testInsert() {
    try {
        console.log('--- Testing Simple Insert ---');
        const [res]: any = await pool.query(
            "INSERT INTO weightandsize (missile_id, missile_name, description, generic_name, property_value, sign, unit, subject) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [4, 'Bulava', 'Launch Weight', 'launchWeight', '36800', 'W', 'kg', 'general']
        );
        console.log('Insert Result:', JSON.stringify(res, null, 2));
        process.exit(0);
    } catch (error: any) {
        console.error('Insert Error Code:', error.code);
        console.error('Insert Error Message:', error.message);
        console.error('Full Error:', error);
        process.exit(1);
    }
}

testInsert();
