
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

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

        console.log('--- INSPECTING BULAVA ---');
        const [missiles] = await connection.query('SELECT * FROM missiles WHERE name LIKE "%Bulava%"');
        console.log('Missile Data:', JSON.stringify(missiles, null, 2));

        if ((missiles as any[]).length > 0) {
            const id = (missiles as any[])[0].id;
            const [images] = await connection.query('SELECT * FROM images WHERE missile_id = ?', [id]);
            console.log('Image/Asset Data:', JSON.stringify(images, null, 2));
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspect();
