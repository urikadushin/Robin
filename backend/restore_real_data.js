
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function restore() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(config);
        const sqlPath = 'C:\\Users\\Omris\\Downloads\\createMySqlRobinDB.sql';

        console.log(`Reading SQL from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Restoring alumadb2...');
        await connection.query(sql);
        console.log('Database restored successfully from user source.');

        await connection.end();
    } catch (err) {
        console.error('Error restoring database:', err.message);
    }
}

restore();
