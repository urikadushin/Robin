import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkConnection() {
    console.log('Testing MySQL Connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        console.log('✅ Connection Successful!');
        await connection.end();
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Connection Failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Tip: Ensure MySQL service is running on the specified host/port.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Tip: Check your username and password in .env file.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('Tip: Ensure the database name exists. Run the creation SQL if needed.');
        }
        process.exit(1);
    }
}

checkConnection();
