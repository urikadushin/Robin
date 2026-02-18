
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function cleanupIssle() {
    console.log('--- Cleaning up "issle" and redundant data ---');
    try {
        const connection = await pool.getConnection();

        // 1. Check all family_type values
        const [rows]: any = await connection.query("SELECT id, name, family_type, type FROM missiles");

        for (const row of rows) {
            let needsUpdate = false;
            let newValue = row.family_type;

            if (row.family_type === 'issle' || row.family_type === 'Missile') {
                newValue = null;
                needsUpdate = true;
            }

            // Also check if family_type is redundant with type
            if (row.family_type && row.type && row.type.includes(row.family_type) && row.family_type.length > 3) {
                newValue = null;
                needsUpdate = true;
            }

            if (needsUpdate) {
                console.log(`Updating missile ${row.name} (${row.id}): family_type '${row.family_type}' -> ${newValue}`);
                await connection.query("UPDATE missiles SET family_type = ? WHERE id = ?", [newValue, row.id]);
            }
        }

        console.log('Cleanup finished.');
        connection.release();
        process.exit(0);
    } catch (error: any) {
        console.error('Cleanup failed:', error.message);
        process.exit(1);
    }
}

cleanupIssle();
