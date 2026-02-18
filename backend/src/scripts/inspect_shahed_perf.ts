
import pool from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function inspectPerformance() {
    try {
        const [perfCols]: any = await pool.query("DESCRIBE performance");
        console.log('performance columns:', perfCols.map((c: any) => c.Field));

        const [shahedPerf]: any = await pool.query(
            "SELECT * FROM performance WHERE missile_id = (SELECT id FROM missiles WHERE name = 'Shahed 136' LIMIT 1)"
        );
        console.log('Shahed 136 Performance data:', JSON.stringify(shahedPerf, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspectPerformance();
