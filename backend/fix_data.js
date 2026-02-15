
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function fix() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        database: 'alumadb2',
        multipleStatements: true
    };

    console.log('Connecting to apply fixes...');
    try {
        const connection = await mysql.createConnection(config);

        const sqlPath = 'c:\\URI\\ALUMA\\Robin-master\\fix_data.sql';
        console.log('Reading SQL file:', sqlPath);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await connection.query(sql);
        console.log('Data fixed successfully.');

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

fix();
