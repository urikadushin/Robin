
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alumadb2',
});

async function inspect() {
    try {
        const connection = await pool.getConnection();

        const [missiles] = await connection.query('SELECT * FROM missiles');
        const [images] = await connection.query('SELECT * FROM images');

        const data = {
            missiles,
            images
        };

        fs.writeFileSync('bulava_debug_dump.json', JSON.stringify(data, null, 2));
        console.log('Dumped data to bulava_debug_dump.json');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspect();
