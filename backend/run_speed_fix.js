
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

    try {
        const connection = await mysql.createConnection(config);
        const sqlPath = 'c:\\URI\\ALUMA\\Robin-master\\fix_speed.sql';
        // Note: I previously moved it to backend, but write_to_file wrote to Robin-master initially. 
        // Let's use the valid path. 
        // Code above wrote to c:\URI\ALUMA\Robin-master\fix_speed.sql.
        // Wait, I ran a move command: "move c:\URI\ALUMA\Robin-master\fix_speed.sql c:\URI\ALUMA\backend\fix_speed.sql"
        const finalSqlPath = 'c:\\URI\\ALUMA\\backend\\fix_speed.sql';

        const sql = fs.readFileSync(finalSqlPath, 'utf8');
        await connection.query(sql);
        console.log('Speed data fixed successfully.');
        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

fix();
