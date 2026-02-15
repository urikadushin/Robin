
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const initialThreats = [
    {
        id: 'irbm1',
        name: 'Emad MRBM',
        color: '#ff6b6b',
        missile: 'Ballistic',
        range: '1700 km',
        minRange: 500,
        maxRange: 1700,
        operationalRange: 1700,
        speed: '2400 m/s',
        weight: '17500 kg',
        countries: 'Iran',
        manufacturer: 'Iran',
        warhead: '1000 kg',
        status: 'Operational',
        year: 2015
    },
    {
        id: 'irbm2',
        name: 'Sejjil-2',
        color: '#ff6b6b',
        missile: 'Ballistic',
        range: '2000 km',
        minRange: 700,
        maxRange: 2000,
        operationalRange: 2000,
        speed: '2600 m/s',
        weight: '21500 kg',
        countries: 'Iran',
        manufacturer: 'Iran',
        warhead: '750 kg',
        status: 'Operational',
        year: 2014
    },
    {
        id: 'yembm1',
        name: 'Qaher-2M',
        color: '#4ecdc4',
        missile: 'Ballistic',
        range: '1800 km',
        minRange: 300,
        maxRange: 1800,
        operationalRange: 1800,
        speed: '2300 m/s',
        weight: '8500 kg',
        countries: 'Yemen (Houthi)',
        manufacturer: 'Yemen (Houthi)',
        warhead: '500 kg',
        status: 'Operational',
        year: 2019
    },
    {
        id: 'lebbm1',
        name: 'Fateh-110',
        color: '#45b7d1',
        missile: 'Ballistic',
        range: '300 km',
        minRange: 50,
        maxRange: 300,
        operationalRange: 300,
        speed: '3500 m/s',
        weight: '3500 kg',
        countries: 'Lebanon (Hezbollah)',
        manufacturer: 'Lebanon (Hezbollah)',
        warhead: '500 kg',
        status: 'Operational',
        year: 2010
    },
    {
        id: 'ircm1',
        name: 'Soumar',
        color: '#ff9f43',
        missile: 'Cruise',
        range: '2500 km',
        speed: '900 km/h',
        weight: '1200 kg',
        countries: 'Iran',
        warhead: '450 kg',
        status: 'Operational',
        year: 2014
    },
    {
        id: 'yemcm1',
        name: 'Quds-1',
        color: '#26de81',
        missile: 'Cruise',
        range: '800 km',
        speed: '864 km/h',
        weight: '300 kg',
        countries: 'Yemen (Houthi)',
        warhead: '45 kg',
        status: 'Operational',
        year: 2019
    },
    {
        id: 'iruav1',
        name: 'Shahed-136',
        color: '#a55eea',
        missile: 'Kamikaze Drone',
        range: '2500 km',
        speed: '185 km/h',
        weight: '200 kg',
        countries: 'Iran',
        warhead: '40 kg',
        status: 'Operational',
        year: 2021
    },
    {
        id: 'lebuav1',
        name: 'Mirsad-1',
        color: '#8854d0',
        missile: 'Surveillance Drone',
        range: '150 km',
        speed: '120 km/h',
        weight: '45 kg',
        countries: 'Lebanon (Hezbollah)',
        warhead: 'N/A',
        status: 'Operational',
        year: 2020
    }
];

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alumadb2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function fixSchema() {
    console.log('Checking schema...');
    try {
        // Check if idweightandsize is primary key
        // We'll just try to ALTER it. If it fails, it might already be set or differ.
        // First make sure it's notable to be AUTO_INCREMENT (needs index)

        // This query tries to add Primary Key if not exists
        try {
            await pool.query('ALTER TABLE weightandsize ADD PRIMARY KEY (idweightandsize)');
            console.log('Added PRIMARY KEY to weightandsize');
        } catch (e: any) {
            if (e.code !== 'ER_MULTIPLE_PRI_KEY') console.log('PK check:', e.message);
        }

        // MODIFY to AUTO_INCREMENT
        await pool.query('ALTER TABLE weightandsize MODIFY idweightandsize INT NOT NULL AUTO_INCREMENT');
        console.log('Modified weightandsize to AUTO_INCREMENT');

    } catch (error) {
        console.error('Schema fix error (non-fatal if already set):', error);
    }
}

async function seed() {
    try {
        await fixSchema();

        const connection = await pool.getConnection();

        console.log('Clearing existing data...');
        // Order matters due to FKs but let's be safe
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DELETE FROM weightandsize');
        await connection.query('DELETE FROM aerodynamic');
        await connection.query('DELETE FROM missiles');
        // Reset auto increments?
        await connection.query('ALTER TABLE missiles AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE weightandsize AUTO_INCREMENT = 1');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Seeding threats...');

        for (const threat of initialThreats) {
            // 1. Insert Missile
            // Map ThreatData to Missile columns: name, type
            // We'll store 'color' maybe? No column for it. We'll stick to schema.
            const [res] = await connection.query<any>(
                'INSERT INTO missiles (name, type, description, status, year, manufacturer, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    threat.name,
                    threat.missile,
                    `Missile from ${threat.countries}`, // Simple description for now
                    threat.status,
                    threat.year,
                    threat.manufacturer,
                    threat.color
                ]
            );
            const missileId = res.insertId;
            console.log(`Inserted ${threat.name} (ID: ${missileId})`);

            // 2. Insert Stats into WeightAndSize
            // Helper to insert generic property
            const insertProp = async (desc: string, val: string | number | undefined, unit: string = '') => {
                if (val === undefined) return;
                const strVal = val.toString().replace(unit, '').trim(); // Remove unit if in string
                await connection.query(
                    `INSERT INTO weightandsize 
                (missile_id, missile_name, description, generic_name, property_value, sign, unit, subject)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        missileId,
                        threat.name,
                        desc, // description (Human readable)
                        desc.toLowerCase().replace(/ /g, '_'), // generic_name (key)
                        strVal,
                        '', // sign
                        unit,
                        'general' // subject
                    ]
                );
            };

            // Map fields
            await insertProp('Range', threat.range, 'km');
            await insertProp('Speed', threat.speed, ''); // Speed often has units in string
            await insertProp('Weight', threat.weight, 'kg');
            await insertProp('Warhead', threat.warhead, 'kg');
            await insertProp('Country', threat.countries);
            // Manufacturer, Status, Year, Color are now in missiles table
        }

        console.log('Seeding complete!');
        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
