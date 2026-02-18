
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixSchema() {
    console.log('--- Fixing Schema: Adding AUTO_INCREMENT ---');
    try {
        const connection = await pool.getConnection();

        // 1. weightandsize
        console.log('Fixing weightandsize...');
        await connection.query("ALTER TABLE weightandsize MODIFY idweightandsize INT AUTO_INCREMENT");

        // 2. massmomentandxcg (just in case)
        console.log('Fixing massmomentandxcg...');
        await connection.query("ALTER TABLE massmomentandxcg MODIFY idmass_prop INT AUTO_INCREMENT");

        // 3. missiles
        console.log('Fixing missiles...');
        await connection.query("ALTER TABLE missiles MODIFY id INT AUTO_INCREMENT");

        console.log('Schema fixed successfully.');
        connection.release();
        process.exit(0);
    } catch (error: any) {
        console.error('Schema fix failed:', error.message);
        process.exit(1);
    }
}

fixSchema();
