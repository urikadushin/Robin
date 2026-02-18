
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixBulavaTypo() {
    console.log('--- Fixing Bulava Executive Summary Typo ---');
    try {
        const connection = await pool.getConnection();

        // 1. Check current value
        const [rows]: any = await connection.query("SELECT id, name, executive_summary_file_name FROM missiles WHERE name LIKE '%Bulava%'");
        console.log('Current entries for Bulava:', JSON.stringify(rows, null, 2));

        for (const row of rows) {
            if (row.executive_summary_file_name === 'blava.htm') {
                console.log(`Fixing missile ${row.name} (${row.id}): blava.htm -> bulava.htm`);
                await connection.query("UPDATE missiles SET executive_summary_file_name = 'bulava.htm' WHERE id = ?", [row.id]);
            }
        }

        // 2. Double check
        const [rowsAfter]: any = await connection.query("SELECT id, name, executive_summary_file_name FROM missiles WHERE name LIKE '%Bulava%'");
        console.log('Entries after fix:', JSON.stringify(rowsAfter, null, 2));

        console.log('Fix finished.');
        connection.release();
        process.exit(0);
    } catch (error: any) {
        console.error('Fix failed:', error.message);
        process.exit(1);
    }
}

fixBulavaTypo();
