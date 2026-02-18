
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixBulavaWeightSimple() {
    console.log('--- Fixing Bulava Weight (Simplified) ---');
    try {
        const connection = await pool.getConnection();

        // 1. Rename conflicting records first
        await connection.query("UPDATE weightandsize SET generic_name='whWeightExplosive' WHERE missile_id=4 AND description='Weight Explosive'");
        await connection.query("UPDATE weightandsize SET generic_name='casingWeight' WHERE missile_id=4 AND description='Weight Casing'");
        await connection.query("UPDATE weightandsize SET generic_name='noseFuzeWeight' WHERE missile_id=4 AND description='Weight Nose and Fuze'");

        // 2. Clear out any other records with generic_name 'launchWeight' for missile_id 4 that are NOT the correct one
        await connection.query("UPDATE weightandsize SET generic_name='otherWeight' WHERE missile_id=4 AND generic_name='launchWeight' AND description != 'Launch Weight'");

        // 3. Upsert correct Launch Weight
        const [rows]: any = await connection.query("SELECT idweightandsize FROM weightandsize WHERE missile_id=4 AND (description='Launch Weight' OR generic_name='launchWeight') LIMIT 1");

        if (rows.length > 0) {
            await connection.query("UPDATE weightandsize SET generic_name='launchWeight', property_value='36800', unit='kg', subject='general', description='Launch Weight' WHERE idweightandsize=?", [rows[0].idweightandsize]);
        } else {
            await connection.query("INSERT INTO weightandsize (missile_id, missile_name, description, generic_name, property_value, unit, subject) VALUES (4, 'Bulava', 'Launch Weight', 'launchWeight', '36800', 'kg', 'general')");
        }

        // 4. Verify
        const [check]: any = await connection.query("SELECT * FROM weightandsize WHERE missile_id=4 AND generic_name='launchWeight'");
        console.log('Final Bulava Launch Weight Check:', JSON.stringify(check, null, 2));

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    }
}

fixBulavaWeightSimple();
