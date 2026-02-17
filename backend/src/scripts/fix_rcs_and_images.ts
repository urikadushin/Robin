
import pool from '../config/database';

async function fixHajqasemAndFindThermal() {
    try {
        console.log('--- Fixing Hajqasem RCS Metadata ---');
        // Check if Hajqasem (missile_id 4) has performance runs
        const [perfs] = await pool.query('SELECT perfIndex FROM performance WHERE missile_name = "hajqasem"');
        console.log('Hajqasem Performance Indices:', perfs);

        for (const p of perfs as any[]) {
            const [existing] = await pool.query('SELECT * FROM rcs WHERE perf_id = ?', [p.perfIndex]);
            if ((existing as any[]).length === 0) {
                console.log(`Adding RCS metadata for Hajqasem Perf ID: ${p.perfIndex}`);
                await pool.query('INSERT INTO rcs (frequency, rcs_type, radars, source, perf_id) VALUES (?, ?, ?, ?, ?)',
                    [1, 'average', 'Frequency-A Frequency-B', 'Simulated', p.perfIndex]);
            }
        }

        console.log('\n--- Finding Thermal Images ---');
        const [thermal] = await pool.query('SELECT * FROM images WHERE image_type = "thermal"');
        console.log('Thermal Images found:', thermal);

        // Also check if any other threats have non-zero RCS trajectories
        // I already know Hajqasem does.

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

fixHajqasemAndFindThermal();
