
import mysql from 'mysql2/promise';

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'qwerty', // Use the known password
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS alumadb2');
        console.log('Database alumadb2 created or already exists.');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('Failed to create database:', error);
        process.exit(1);
    }
}

createDatabase();
