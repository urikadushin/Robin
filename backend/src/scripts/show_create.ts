
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function showCreate() {
    try {
        const [rows]: any = await pool.query("SHOW CREATE TABLE weightandsize");
        console.log('CREATE TABLE:', rows[0]['Create Table']);
        process.exit(0);
    } catch (error: any) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

showCreate();
