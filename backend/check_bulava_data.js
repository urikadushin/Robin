
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

        console.log('--- WEIGHT AND SIZE FOR BULAVA (ID 4) ---');
        const [ws] = await connection.execute('SELECT * FROM weightandsize WHERE missile_id = 4');
        console.log(JSON.stringify(ws, null, 2));

        console.log('\n--- PERFORMANCE FOR BULAVA (ID 4) ---');
        const [perf] = await connection.execute('SELECT * FROM performance WHERE missile_id = 4');
        console.log(JSON.stringify(perf, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

check();
