
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixShahedRange() {
    console.log('--- Fixing Shahed 136 Range to 2000km ---');
    try {
        const connection = await pool.getConnection();

        // 1. Find Shahed 136 ID (should be 6)
        const [missiles]: any = await connection.query(
            "SELECT id FROM missiles WHERE name = 'Shahed 136'"
        );

        if (missiles.length === 0) {
            console.log('Error: Shahed 136 not found.');
            return;
        }

        const id = missiles[0].id;
        console.log(`Found Shahed 136 with ID: ${id}`);

        // 2. Update weightandsize
        // We ensure generic_name is 'maxRange' (camelCase) to match threatMapper.ts getVal('maxRange')
        // And update the value to 2000.
        const [resWS] = await connection.query(
            "UPDATE weightandsize SET generic_name = 'maxRange', property_value = '2000' WHERE missile_id = ? AND (generic_name = 'max_range' OR generic_name = 'maxRange' OR generic_name = 'range')",
            [id]
        );
        console.log(`Updated weightandsize: ${JSON.stringify(resWS)}`);

        // If no rows were updated, it might not have the record at all. Let's insert it just in case.
        const [checkWS]: any = await connection.query(
            "SELECT * FROM weightandsize WHERE missile_id = ? AND generic_name = 'maxRange'",
            [id]
        );
        if (checkWS.length === 0) {
            console.log('Inserting missing maxRange record into weightandsize...');
            await connection.query(
                "INSERT INTO weightandsize (missile_id, missile_name, description, generic_name, property_value, unit, subject) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [id, 'Shahed 136', 'Maximum Range', 'maxRange', '2000', 'km', 'general']
            );
        }

        // 3. Update performance table
        // This is what currently shows "50" in the header because maxRange was missing/mismatched.
        const [resPerf] = await connection.query(
            "UPDATE performance SET rng = 2000 WHERE missile_id = ?",
            [id]
        );
        console.log(`Updated performance table: ${JSON.stringify(resPerf)}`);

        console.log('--- Success: Shahed 136 range is now 2000km ---');
        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

fixShahedRange();
