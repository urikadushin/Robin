
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function inspectSchema() {
    try {
        const [wsCols]: any = await pool.query("DESCRIBE weightandsize");
        console.log('weightandsize columns:', wsCols.map((c: any) => c.Field));

        const [missilesCols]: any = await pool.query("DESCRIBE missiles");
        console.log('missiles columns:', missilesCols.map((c: any) => c.Field));

        const [shahedWs]: any = await pool.query(
            "SELECT * FROM weightandsize WHERE missile_id = (SELECT id FROM missiles WHERE name = 'Shahed 136' LIMIT 1)"
        );
        console.log('Shahed 136 WeightAndSize data:', JSON.stringify(shahedWs, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspectSchema();
