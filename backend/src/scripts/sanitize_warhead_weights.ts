
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function sanitizeWarheadNames() {
    console.log('--- Sanitizing Warhead Generic Names ---');
    try {
        const connection = await pool.getConnection();

        // 1. Find all potential warhead weight records
        // Looking for descriptions like 'Weight Warhead', 'משקל רש"ק', 'Warhead Mass', etc.
        const [rows]: any = await connection.query(`
            SELECT idweightandsize, description, generic_name, property_value, missile_name, subject 
            FROM weightandsize 
            WHERE description LIKE '%Warhead%' 
               OR description LIKE '%payload%'
               OR description LIKE '%משקל רש"ק%'
        `);

        console.log(`Found ${rows.length} potential warhead/payload records.`);

        for (const row of rows) {
            // If it's a warhead weight, we want generic_name to be 'payloadWeight'
            // (Standardizing on payloadWeight since 'launchWeight' is already taken by total weight)

            let shouldUpdate = false;
            let newGenericName = 'payloadWeight';

            if (row.generic_name !== newGenericName) {
                // Special case: don't overwrite if it's already something valid but different?
                // Actually, for consistency in our app, payloadWeight is best.
                shouldUpdate = true;
            }

            if (shouldUpdate) {
                console.log(`Updating ${row.missile_name} | ${row.description}: ${row.generic_name} -> ${newGenericName}`);
                await connection.query("UPDATE weightandsize SET generic_name = ? WHERE idweightandsize = ?", [newGenericName, row.idweightandsize]);
            }
        }

        console.log('Sanitization finished.');
        connection.release();
        process.exit(0);
    } catch (error: any) {
        console.error('Sanitization failed:', error.message);
        process.exit(1);
    }
}

sanitizeWarheadNames();
