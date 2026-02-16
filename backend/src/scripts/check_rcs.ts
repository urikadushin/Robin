import pool from '../config/database';

async function checkRcs() {
    console.log('Checking RCS paths in rcs table...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT missile_name, rcsIndex, runName, csvPath FROM rcs LIMIT 20`);
        (rows as any[]).forEach(row => {
            console.log(`[RCS] Missile: ${row.missile_name} | Run: ${row.runName} | Path: ${row.csvPath}`);
        });

        connection.release();
    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        process.exit(0);
    }
}

checkRcs();
