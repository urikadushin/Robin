
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixSchemaSafely() {
    console.log('--- Fixing Schema Safely ---');
    try {
        const connection = await pool.getConnection();
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");

        try {
            console.log('Adding AUTO_INCREMENT to weightandsize...');
            await connection.query("ALTER TABLE weightandsize MODIFY idweightandsize INT AUTO_INCREMENT");
        } catch (e: any) {
            console.warn('WeightAndSize fix warning:', e.message);
        }

        try {
            console.log('Adding AUTO_INCREMENT to missiles...');
            await connection.query("ALTER TABLE missiles MODIFY id INT AUTO_INCREMENT");
        } catch (e: any) {
            console.warn('Missiles fix warning:', e.message);
        }

        await connection.query("SET FOREIGN_KEY_CHECKS = 1");
        console.log('Done.');
        connection.release();
        process.exit(0);
    } catch (error: any) {
        console.error('Final failure:', error.message);
        process.exit(1);
    }
}

fixSchemaSafely();
