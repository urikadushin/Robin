
const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        database: 'alumadb2' // Hardcoded to be sure
    };

    console.log('Connecting to:', config.database);
    try {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute('SELECT id, name FROM missiles');
        console.log('Rows in missiles table:');
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

check();
