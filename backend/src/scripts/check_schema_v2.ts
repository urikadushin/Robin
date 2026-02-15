
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'qwerty',
            database: process.env.DB_NAME || 'alumadb2',
        });

        const [rows] = await connection.query('SHOW COLUMNS FROM missiles');
        console.log('--- missiles table columns ---');
        (rows as any[]).forEach(row => {
            console.log(`${row.Field}: ${row.Type}`);
        });

        console.log('\n--- weightandsize table columns ---');
        const [wsRows] = await connection.query('SHOW COLUMNS FROM weightandsize');
        (wsRows as any[]).forEach(row => {
            console.log(`${row.Field}: ${row.Type}`);
        });

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSchema();
