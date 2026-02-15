
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function updateSchema() {
    console.log('Starting schema update...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'qwerty',
            database: process.env.DB_NAME || 'alumadb2',
        });

        const columnsToAdd = [
            'ADD COLUMN description TEXT',
            'ADD COLUMN status VARCHAR(50)',
            'ADD COLUMN year INT',
            'ADD COLUMN manufacturer VARCHAR(100)',
            'ADD COLUMN color VARCHAR(20)'
        ];

        // Check which columns already exist to avoid errors
        const [rows] = await connection.query('SHOW COLUMNS FROM missiles');
        const existingColumns = (rows as any[]).map(row => row.Field);

        const columnsToActuallyAdd = columnsToAdd.filter(col => {
            const colName = col.split(' ')[2]; // e.g. "ADD COLUMN description" -> "description"
            if (existingColumns.includes(colName)) {
                console.log(`Column ${colName} already exists. Skipping.`);
                return false;
            }
            return true;
        });

        if (columnsToActuallyAdd.length > 0) {
            const alterQuery = `ALTER TABLE missiles ${columnsToActuallyAdd.join(', ')}`;
            console.log('Executing:', alterQuery);
            await connection.query(alterQuery);
            console.log('Schema update complete: Columns added.');
        } else {
            console.log('Schema update complete: No new columns needed.');
        }

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
