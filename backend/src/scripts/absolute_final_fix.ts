
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function finalFix() {
    console.log('--- FINAL FIX: Schema + Bulava weight ---');
    try {
        const connection = await pool.getConnection();
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");

        // 1. Fix Schema: MUST be PRIMARY KEY to have AUTO_INCREMENT
        console.log('Setting PRIMARY KEY and AUTO_INCREMENT...');
        // Check if primary key exists. If not, add it.
        // According to SHOW CREATE TABLE it was NOT defined as PRIMARY KEY in the constraint list for idweightandsize
        // Wait, line 10 said PRIMARY KEY but maybe it was missing or something. 
        // Actually, let's just be explicit.
        try {
            await connection.query("ALTER TABLE weightandsize ADD PRIMARY KEY (idweightandsize)");
        } catch (e) { }

        await connection.query("ALTER TABLE weightandsize MODIFY idweightandsize INT AUTO_INCREMENT");

        // 2. Rename conflicting records for Bulava
        console.log('Renaming conflicting generic names...');
        await connection.query("UPDATE weightandsize SET generic_name='whWeightExplosive' WHERE missile_id=4 AND description='Weight Explosive'");
        await connection.query("UPDATE weightandsize SET generic_name='casingWeight' WHERE missile_id=4 AND description='Weight Casing'");
        await connection.query("UPDATE weightandsize SET generic_name='noseFuzeWeight' WHERE missile_id=4 AND description='Weight Nose and Fuze'");

        // 3. Set the correct launch weight for Bulava
        console.log('Upserting Bulava Launch Weight (36800)...');
        const [rows]: any = await connection.query("SELECT idweightandsize FROM weightandsize WHERE missile_id=4 AND (description='Launch Weight' OR generic_name='launchWeight') LIMIT 1");

        if (rows.length > 0) {
            await connection.query("UPDATE weightandsize SET generic_name='launchWeight', property_value='36800', unit='kg', subject='general', description='Launch Weight' WHERE idweightandsize=?", [rows[0].idweightandsize]);
        } else {
            await connection.query("INSERT INTO weightandsize (missile_id, missile_name, description, generic_name, property_value, sign, unit, subject) VALUES (4, 'Bulava', 'Launch Weight', 'launchWeight', '36800', 'W', 'kg', 'general')");
        }

        await connection.query("SET FOREIGN_KEY_CHECKS = 1");

        // 4. Verify
        const [check]: any = await connection.query("SELECT * FROM weightandsize WHERE missile_id=4 AND (generic_name='launchWeight' OR generic_name='whWeightExplosive')");
        console.log('Verification Results:', JSON.stringify(check, null, 2));

        connection.release();
        console.log('--- ALL FIXES APPLIED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error: any) {
        console.error('Final Fix Failed:', error.message);
        process.exit(1);
    }
}

finalFix();
