
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'alumadb2'
};

const dataroot = 'C:\\URI\\ALUMA\\dataroot';

async function verify() {
    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('Connected to database.');

        // 1. Check for Hebrew strings
        const [tables] = await connection.query('SHOW TABLES');
        let hebrewFound = false;
        // Use a simpler Hebrew detection regex for MySQL REGEXP
        const hebRegex = '[א-ת]';
        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            const [columns] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
            for (const col of columns) {
                if (col.Type.includes('char') || col.Type.includes('text')) {
                    const [rows] = await connection.query(`SELECT \`${col.Field}\` as v FROM \`${tableName}\` WHERE \`${col.Field}\` REGEXP '${hebRegex}' LIMIT 1`);
                    if (rows.length > 0) {
                        console.log(`[HEBREW] Found Hebrew in ${tableName}.${col.Field}:`, rows[0].v);
                        hebrewFound = true;
                    }
                }
            }
        }
        if (!hebrewFound) console.log('[OK] No Hebrew characters found in checked columns.');

        // 2. Check for key missiles
        const [missiles] = await connection.query('SELECT name FROM missiles');
        const missileNames = missiles.map(m => m.name);
        console.log('Missiles in DB:', missileNames.join(', '));
        const expected = ['bulava', 'emad', 'shahed136', 'hajqasem'];
        expected.forEach(m => {
            if (!missileNames.includes(m)) console.log(`[MISSING] Missile ${m} not found in DB.`);
        });

        // 3. Verify Image Paths
        const [images] = await connection.query('SELECT * FROM images');
        console.log(`Verifying ${images.length} image paths...`);
        let missingFiles = 0;
        for (const img of images) {
            const type = img.image_type;
            const filename = img.image_path;
            const mName = img.missile_name.toUpperCase();
            const mNameLower = img.missile_name.toLowerCase();

            if (!filename || filename === 'NULL' || filename === 'null') continue;

            let dirs = [];
            if (type === 'executiveSummary') {
                dirs = [
                    'ExecutiveSummary',
                    path.join('Images', 'ExecutiveSummary', mName),
                    path.join('Images', 'ExecutiveSummary', mNameLower)
                ];
            } else if (type === '3dModel') {
                dirs = ['3DModel'];
            } else {
                const typeMap = { 'physicalData': 'PhysicalData', 'rcs': 'Rcs', 'thermal': 'Thermal' };
                const folder = typeMap[type] || 'Images';
                dirs = [
                    path.join('Images', folder), // Root of the type folder
                    path.join('Images', folder, mName),
                    path.join('Images', folder, mNameLower),
                    'Images', 'BtUnit', 'RvUnit'
                ];
            }

            let found = false;
            for (const d of dirs) {
                const fullPath = path.join(dataroot, d, filename);
                if (fs.existsSync(fullPath)) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log(`[FILE MISSING] ${filename} (Type: ${type}, Missile: ${img.missile_name})`);
                missingFiles++;
            }
        }
        if (missingFiles === 0) console.log('[OK] All image files (with known types) found in dataroot.');
        else console.log(`[WARNING] Total missing files: ${missingFiles}`);

        // 4. Check for "Unknown" values
        const [unknowns] = await connection.query('SELECT COUNT(*) as count FROM weightandsize WHERE property_value = "Unknown"');
        console.log(`"Unknown" values in weightandsize: ${unknowns[0].count}`);

    } catch (err) {
        console.error('Verification failed:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

verify();
