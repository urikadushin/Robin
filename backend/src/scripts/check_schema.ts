
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkSchema() {
    try {
        const globalPool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'qwerty',
            database: process.env.DB_NAME || 'alumadb2',
        });

        const [rows] = await globalPool.query('DESCRIBE missiles');
        console.table(rows);

        const [wsRows] = await globalPool.query('DESCRIBE weightandsize');
        console.table(wsRows);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
