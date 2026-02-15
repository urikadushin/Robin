
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

        console.log('Searching for speed/velocity in weightandsize...');
        const [rows] = await connection.query(`
            SELECT * FROM weightandsize 
            WHERE description LIKE '%מהירות%' 
               OR description LIKE '%speed%' 
               OR description LIKE '%velocity%'
               OR unit LIKE '%m/s%'
               OR unit LIKE '%mach%'
        `);

        console.log(JSON.stringify(rows, null, 2));

        console.log('Checking Generic Names for Speed/Weight:');
        const [genRows] = await connection.query(`
            SELECT missile_id, missile_name, generic_name, description, property_value 
            FROM weightandsize 
            WHERE generic_name IN ('speed', 'weight', 'launchWeight', 'maxRange')
            ORDER BY missile_id
        `);
        console.log(JSON.stringify(genRows, null, 2));

        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

check();
