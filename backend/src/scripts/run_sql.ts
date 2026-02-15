
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function runSql() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'qwerty',
            database: 'alumadb2',
            multipleStatements: true // Essential for running the dump
        });

        const sqlPath = path.resolve(__dirname, '../../../createMySqlRobinDB.sql');
        console.log(`Reading SQL from: ${sqlPath}`);

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await connection.query(sql);

        console.log('SQL executed successfully.');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('Failed to run SQL:', error);
        process.exit(1);
    }
}

runSql();
