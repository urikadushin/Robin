
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixWeightsAndStandardize() {
    console.log('--- Standardizing Generic Names and Fixing Weights ---');
    try {
        const connection = await pool.getConnection();

        // 1. Standardize generic_names to camelCase
        const standardizations = [
            { from: 'launch_weight', to: 'launchWeight' },
            { from: 'wh_weight', to: 'whWeight' },
            { from: 'max_range', to: 'maxRange' },
            { from: 'total_length', to: 'totalLength' }
        ];

        for (const std of standardizations) {
            const [res] = await connection.query(
                "UPDATE weightandsize SET generic_name = ? WHERE generic_name = ?",
                [std.to, std.from]
            );
            console.log(`Standardized ${std.from} -> ${std.to}: ${JSON.stringify(res)}`);
        }

        // 2. Add missing Launch Weight for Bulava (missile_id: 4)
        // Check if it already exists (under any name we might have just standardized)
        const [checkBulava]: any = await connection.query(
            "SELECT * FROM weightandsize WHERE missile_id = 4 AND generic_name = 'launchWeight' AND subject = 'general'"
        );

        if (checkBulava.length === 0) {
            console.log('Inserting Bulava Launch Weight (36,800 kg)...');
            await connection.query(
                "INSERT INTO weightandsize (missile_id, missile_name, description, generic_name, property_value, unit, subject) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [4, 'Bulava', 'Launch Weight', 'launchWeight', '36800', 'kg', 'general']
            );
        } else {
            console.log('Bulava Launch Weight already exists, updating value to 36800...');
            await connection.query(
                "UPDATE weightandsize SET property_value = '36800' WHERE missile_id = 4 AND generic_name = 'launchWeight' AND subject = 'general'",
            );
        }

        // 3. Fix Hajqasem Warhead Weight generic_name (it was launch_weight incorrectly)
        // We look for description 'Weight Warhead' for Hajqasem (id: 7)
        await connection.query(
            "UPDATE weightandsize SET generic_name = 'whWeight' WHERE missile_id = 7 AND description = 'Weight Warhead'",
        );
        console.log('Fixed Hajqasem Warhead Weight generic_name.');

        console.log('--- Success: Data standardized and weights fixed ---');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

fixWeightsAndStandardize();
