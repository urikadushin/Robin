
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkWeights() {
    try {
        const connection = await pool.getConnection();

        const missiles = ['bulava', 'emad', 'hajqasem', 'shahed136'];
        console.log('--- Checking WeightAndSize for: ' + missiles.join(', ') + ' ---');

        const [rows]: any = await connection.query(
            "SELECT missile_name, generic_name, property_value, description, unit FROM weightandsize WHERE missile_name IN (?, ?, ?, ?)",
            missiles
        );

        // Group by missile
        const grouped = rows.reduce((acc: any, row: any) => {
            if (!acc[row.missile_name]) acc[row.missile_name] = [];
            acc[row.missile_name].push(row);
            return acc;
        }, {});

        for (const name of missiles) {
            console.log(`\n>> ${name.toUpperCase()}`);
            if (grouped[name]) {
                const weightRow = grouped[name].find((r: any) =>
                    ['launch_weight', 'launchWeight', 'weight', 'totalWeight'].includes(r.generic_name) ||
                    r.description?.toLowerCase().includes('weight')
                );
                if (weightRow) {
                    console.log(`FOUND WEIGHT: generic_name=${weightRow.generic_name}, value=${weightRow.property_value}, desc=${weightRow.description}`);
                } else {
                    console.log('NO WEIGHT PROPERTY FOUND');
                }
                // Show all generic names to catch unusual ones
                console.log('Available generic_names: ' + grouped[name].map((r: any) => r.generic_name).join(', '));
            } else {
                console.log('NO RECORDS FOUND FOR THIS MISSILE NAME');
            }
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

checkWeights();
