
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function updateShahedRange() {
    console.log('--- Updating Shahed 136 Range to 2000km ---');
    try {
        const connection = await pool.getConnection();

        // 1. Find Shahed 136 ID
        const [missiles]: any = await connection.query(
            "SELECT id FROM missiles WHERE name = 'Shahed 136'"
        );

        if (missiles.length === 0) {
            console.log('Error: Shahed 136 not found in database.');
            return;
        }

        const id = missiles[0].id;
        console.log(`Found Shahed 136 with ID: ${id}`);

        // 2. Update weightandsize
        // We look for 'maxRange' generic name as primary source for 'range' in threatMapper
        const [updateWs] = await connection.query(
            "UPDATE weightandsize SET property_value = '2000' WHERE missile_id = ? AND (generic_name = 'maxRange' OR generic_name = 'range')",
            [id]
        );
        console.log('Updated weightandsize range records.');

        // If no rows were updated, it might not have the record at all. Let's check.
        const [rows]: any = await connection.query(
            "SELECT * FROM weightandsize WHERE missile_id = ? AND generic_name = 'maxRange'",
            [id]
        );

        if (rows.length === 0) {
            console.log('maxRange record missing, creating it...');
            await connection.query(
                "INSERT INTO weightandsize (missile_id, missile_name, description, generic_name, property_value, unit, subject) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [id, 'Shahed 136', 'טווח מקסימום', 'maxRange', '2000', 'km', 'general']
            );
            console.log('Created maxRange record.');
        }

        // 3. Clear any conflicting aerodynamic or performance data for simplicity if it exists and holds low values
        // Actually, let's just make sure maxRange is set.

        console.log('Success: Shahed 136 range updated to 2000km.');
        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updateShahedRange();
