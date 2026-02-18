
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixWarheadNames() {
    console.log('--- Fixing Incorrect Warhead Generic Names ---');
    try {
        const connection = await pool.getConnection();

        // 1. Find all records currently mapped to 'payloadWeight'
        const [rows]: any = await connection.query(`
            SELECT idweightandsize, description, generic_name, missile_name, sign, unit 
            FROM weightandsize 
            WHERE generic_name = 'payloadWeight'
        `);

        console.log(`Checking ${rows.length} records mapped to 'payloadWeight'.`);

        for (const row of rows) {
            const desc = row.description.toLowerCase();
            // A record should only be payloadWeight if it's actually describing weight/mass
            const describesWeight =
                desc.includes('weight') ||
                desc.includes('mass') ||
                desc.includes('משקל') ||
                row.sign === 'W' ||
                row.unit === 'kg';

            if (!describesWeight) {
                console.log(`Reverting ${row.missile_name} | ${row.description}: payloadWeight -> null`);
                // Reverting to null or a more appropriate name if we can guess it
                let newName: string | null = null;
                if (desc.includes('length')) newName = 'length';
                if (desc.includes('diameter')) newName = 'diameter';
                if (desc.includes('thickness')) newName = 'wallThickness';

                await connection.query("UPDATE weightandsize SET generic_name = ? WHERE idweightandsize = ?", [newName, row.idweightandsize]);
            } else {
                console.log(`Keeping ${row.missile_name} | ${row.description} as payloadWeight.`);
            }
        }

        console.log('Fix finished.');
        connection.release();
        process.exit(0);
    } catch (error: any) {
        console.error('Fix failed:', error.message);
        process.exit(1);
    }
}

fixWarheadNames();
