import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function exportDatabase() {
    console.log('Exporting database to SQL dump...');
    try {
        const connection = await pool.getConnection();

        let sql = '-- AeroDan Database Dump\n';
        sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

        const tables = ['missiles', 'weightandsize', 'aerodynamic', 'images'];

        for (const table of tables) {
            console.log(`Exporting table: ${table}`);

            // 1. Get CREATE TABLE
            const [createRows]: any = await connection.query(`SHOW CREATE TABLE ${table}`);
            sql += `${createRows[0]['Create Table']};\n\n`;

            // 2. Get Data
            const [dataRows]: any = await connection.query(`SELECT * FROM ${table}`);
            if (dataRows.length > 0) {
                const columns = Object.keys(dataRows[0]).join(', ');
                sql += `INSERT INTO ${table} (${columns}) VALUES \n`;

                const values = dataRows.map((row: any) => {
                    const rowValues = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        return val;
                    });
                    return `(${rowValues.join(', ')})`;
                }).join(',\n');

                sql += `${values};\n\n`;
            }
        }

        sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';

        const outputPath = path.resolve(__dirname, '../../database_dump.sql');
        fs.writeFileSync(outputPath, sql);
        console.log(`Database exported to: ${outputPath}`);

        connection.release();
    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        process.exit(0);
    }
}

exportDatabase();
