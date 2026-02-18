import pool from '../config/database';

async function dump6DOFData() {
    console.log('Searching for 6DOF data...');
    try {
        const connection = await pool.getConnection();

        const [aero] = await connection.query(`SELECT * FROM aerodynamic WHERE dim = 2 LIMIT 1`);
        if ((aero as any[]).length > 0) {
            console.log('Found 6DOF part:');
            console.log(JSON.stringify((aero as any[])[0], null, 2));
        } else {
            console.log('No 6DOF data found.');
        }

        connection.release();
    } catch (error) {
        console.error('Dump failed:', error);
    } finally {
        process.exit(0);
    }
}

dump6DOFData();
