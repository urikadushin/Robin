
import pool from '../config/database';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function dumpSchema() {
    try {
        const [rows]: any = await pool.query("SHOW CREATE TABLE weightandsize");
        fs.writeFileSync('schema_dump.txt', rows[0]['Create Table']);
        console.log('Schema dumped to schema_dump.txt');
        process.exit(0);
    } catch (error: any) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

dumpSchema();
