
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixBulavaWeight() {
    console.log('--- Fixing Bulava Weight and Cleaning up generic_names ---');
    try {
        const connection = await pool.getConnection();

        // 1. Rename existing incorrect launchWeight records for Bulava (missile_id: 4)
        // These were accidentally renamed by my previous script or existed before.
        const renames = [
            { desc: 'Weight Explosive', new_gn: 'explosiveWeight' },
            { desc: 'Weight Casing', new_gn: 'casingWeight' },
            { desc: 'Weight Nose and Fuze', new_gn: 'noseFuzeWeight' }
        ];

        for (const r of renames) {
            await connection.query(
                "UPDATE weightandsize SET generic_name = ? WHERE missile_id = 4 AND description = ?",
                [r.new_gn, r.desc]
            );
            console.log(`Renamed generic_name for Bulava ${r.desc} to ${r.new_gn}`);
        }

        // 2. Ensure a proper launchWeight record exists for Bulava (36800 kg)
        const [checkBulava]: any = await connection.query(
            "SELECT * FROM weightandsize WHERE missile_id = 4 AND (generic_name = 'launchWeight' OR description = 'Launch Weight')"
        );

        if (checkBulava.length > 0) {
            console.log('Updating existing Bulava Launch Weight record to 36800...');
            await connection.query(
                "UPDATE weightandsize SET generic_name = 'launchWeight', property_value = '36800', unit = 'kg', subject = 'general', description = 'Launch Weight' WHERE missile_id = 4 AND (generic_name = 'launchWeight' OR description = 'Launch Weight' OR idweightandsize = ?)",
                [checkBulava[0].idweightandsize]
            );
        } else {
            console.log('Inserting new Bulava Launch Weight record (36800)...');
            await connection.query(
                "INSERT INTO weightandsize (missile_id, missile_name, description, generic_name, property_value, unit, subject) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [4, 'Bulava', 'Launch Weight', 'launchWeight', '36800', 'kg', 'general']
            );
        }

        // 3. Cleanup other missiles if they have same collision (optional but good)
        // For now, let's focus on Bulava.

        console.log('--- Success: Bulava weight fixed to 36800kg and generic names cleaned ---');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

fixBulavaWeight();
