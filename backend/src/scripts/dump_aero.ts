import pool from '../config/database';

async function dumpAeroData() {
    console.log('Starting dump script...');
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database.');

        const [missiles] = await connection.query(`SELECT id, name FROM missiles WHERE name LIKE '%emad%'`);
        const emad = (missiles as any[])[0];

        if (!emad) {
            console.error('Emad not found in database');
            const [all] = await connection.query(`SELECT id, name FROM missiles LIMIT 5`);
            console.log('Available missiles:', all);
            return;
        }

        console.log(`Found missile: ${emad.name} (ID: ${emad.id})`);

        const [aero] = await connection.query(`SELECT * FROM aerodynamic WHERE missile_id = ?`, [emad.id]);
        console.log('Aerodynamic data parts count:', (aero as any[]).length);

        if ((aero as any[]).length > 0) {
            const first = (aero as any[])[0];
            console.log('First part keys:', Object.keys(first));
            console.log('mach_vec sample:', first.mach_vec?.substring(0, 50));
            console.log('alpha_vec sample:', first.alpha_vec?.substring(0, 50));
            console.log('dim:', first.dim);

            // Log full JSON if possible
            console.log('Full first part:');
            console.log(JSON.stringify(first, null, 2));
        }

        connection.release();
    } catch (error) {
        console.error('Dump failed with error:', error);
    } finally {
        console.log('Exiting...');
        process.exit(0);
    }
}

dumpAeroData();
