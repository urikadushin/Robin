
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function restore() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        multipleStatements: true
    };

    console.log('Connecting to restore DB...');
    try {
        const connection = await mysql.createConnection(config);

        const sqlPath = 'c:\\URI\\ALUMA\\createMySqlRobinDB.sql';
        console.log('Reading SQL file:', sqlPath);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await connection.query(sql);
        console.log('Database restored successfully.');

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

restore();
