
const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        database: 'alumadb2'
    };

    try {
        const connection = await mysql.createConnection(config);

        console.log('Checking Performance Data (Speed):');
        const [rows] = await connection.query(`
            SELECT m.name, p.velEndOfBurn 
            FROM missiles m
            JOIN performance p ON m.id = p.missile_id
        `);
        console.log(JSON.stringify(rows, null, 2));

        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

check();
