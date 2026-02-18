
import pool from '../config/database';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function auditWeights() {
    try {
        const connection = await pool.getConnection();
        const [rows]: any = await connection.query("SELECT * FROM weightandsize");
        fs.writeFileSync('weight_audit.json', JSON.stringify(rows, null, 2));
        console.log('Audit saved to weight_audit.json');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

auditWeights();
