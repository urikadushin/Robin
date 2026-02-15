
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'alumadb2'
};

async function checkDistribution() {
    let connection;
    try {
        connection = await mysql.createConnection(config);

        // Fetch missiles and their IDs
        const [missileRows] = await connection.query('SELECT id, name FROM missiles');
        const tables = [
            'aerodynamic', 'weightandsize', 'images', 'performance',
            'rcs', 'massmomentandxcg', 'capability', 'engine', 'launcharea'
        ];

        console.log('Global table counts:');
        for (const table of tables) {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table}: ${rows[0].count}`);
        }

        console.log('\nData distribution per missile:');
        for (const m of missileRows) {
            console.log(`\n--- ${m.name.toUpperCase()} (ID: ${m.id}) ---`);
            for (const table of tables) {
                // Check if table has missile_id or missile_name or missileID column
                const [cols] = await connection.query(`SHOW COLUMNS FROM ${table}`);
                const hasId = cols.some(c => c.Field === 'missile_id');
                const hasName = cols.some(c => c.Field === 'missile_name');
                const hasIDCap = cols.some(c => c.Field === 'missileID');

                let count = 0;
                if (hasId) {
                    const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table} WHERE missile_id = ?`, [m.id]);
                    count = rows[0].count;
                } else if (hasIDCap) {
                    const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table} WHERE missileID = ?`, [m.id]);
                    count = rows[0].count;
                } else if (hasName) {
                    const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table} WHERE missile_name = ?`, [m.name]);
                    count = rows[0].count;
                } else {
                    console.log(`[SKIP] Table ${table} has no recognized missile column`);
                    continue;
                }
                console.log(`${table}: ${count}`);
            }
        }
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkDistribution();
