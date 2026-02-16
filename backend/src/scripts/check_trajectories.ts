import pool from '../config/database';

async function checkTrajectories() {
    console.log('Checking trajectory paths in performance table...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT missile_name, perfIndex, trajType, trajectoryRvPath, trajectoryBtPath FROM performance LIMIT 20`);
        (rows as any[]).forEach(row => {
            console.log(`[Perf] Missile: ${row.missile_name} | Run: ${row.perfIndex} | Type: ${row.trajType}`);
            console.log(`       RV Path: ${row.trajectoryRvPath}`);
            console.log(`       BT Path: ${row.trajectoryBtPath}`);
        });

        connection.release();
    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        process.exit(0);
    }
}

checkTrajectories();
