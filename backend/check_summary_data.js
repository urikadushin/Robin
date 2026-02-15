const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'alumadb2'
    });

    console.log('--- MISSILES ---');
    const [missiles] = await conn.query('SELECT id, name, description FROM missiles');
    console.log(missiles);

    console.log('\n--- EXECUTIVE SUMMARY IMAGES ---');
    const [images] = await conn.query('SELECT missile_name, image_type, image_path FROM images WHERE image_type = "executiveSummary"');
    console.log(images);

    await conn.end();
}

check().catch(console.error);
