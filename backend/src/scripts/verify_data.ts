
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alumadb2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function verify() {
    try {
        const connection = await pool.getConnection();

        const [missiles] = await connection.query('SELECT id, name, color, manufacturer, status, year FROM missiles');
        console.log('Missiles:', missiles);

        const [weights] = await connection.query('SELECT * FROM weightandsize');
        console.log('WeightAndSize Entries:', (weights as any[]).length);

        // Sample check
        if ((missiles as any[]).length > 0 && (weights as any[]).length > 0) {
            console.log('VERIFICATION SUCCESS: Data exists in both tables.');
        } else {
            console.log('VERIFICATION FAILED: Tables missing data.');
            process.exit(1);
        }

        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('Verification query failed:', error);
        process.exit(1);
    }
}

verify();
