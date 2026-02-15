
import pool from '../config/database';

async function restore() {
    try {
        console.log('Clearing old data...');
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('TRUNCATE weightandsize');
        await pool.query('TRUNCATE aerodynamic');
        await pool.query('TRUNCATE missiles');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Inserting real missiles...');
        // IDs match the original SQL file exactly
        await pool.query(`INSERT INTO missiles (id, name, type, num_of_stages, family_type, explosive_type, executive_summary_file_name, content_rv_file_name, content_bt_file_name, flight_logic_file_name, color) VALUES 
            (4, 'bulava', 'Ballistic', 4, 'missile', 'mirv', 'bulava.htm', 'bulava_Rv.htm', 'bulava_bt.htm', 'bulava_logic.htm', '#ff6b6b'),
            (5, 'emad', 'Ballistic', 1, 'missile', 'whole', 'emad.htm', 'emad_Rv.htm', 'emad_bt.htm', 'emad_logic.htm', '#4ecdc4'),
            (6, 'shahed136', 'UAV', 1, 'UAV', 'cluster', 'shahed136.htm', 'shahed136_Rv.htm', 'shahed136_bt.htm', 'shahed136_logic.htm', '#45b7d1'),
            (7, 'hajqasem', 'Ballistic', 1, 'missile', 'whole', 'hajqasem.htm', 'hajqasem_Rv.htm', 'hajqasem_bt.htm', 'hajqasem_logic.htm', '#ff9f43')`);

        console.log('Inserting weightandsize data...');
        // Data derived from createMySqlRobinDB.sql lines 700-762
        const wsData = [
            // bulava (4)
            [4, 'bulava', 'd', '2'],
            [4, 'bulava', 'totalLength', '12.1'],
            [4, 'bulava', 'wh_weight', '701'],
            [4, 'bulava', 'range', '9300'],
            [4, 'bulava', 'speed', 'Mach 24'],

            // emad (5)
            [5, 'emad', 'wh_weight', '750'],
            [5, 'emad', 'totalLength', '15.5'],
            [5, 'emad', 'd', '1.25'],
            [5, 'emad', 'weight', '17500'],
            [5, 'emad', 'range', '1700'],
            [5, 'emad', 'speed', '2400 m/s'],

            // shahed136 (6)
            [6, 'shahed136', 'totalLength', '3.5'],
            [6, 'shahed136', 'range', '2500'],
            [6, 'shahed136', 'weight', '200'],
            [6, 'shahed136', 'speed', '185 km/h'],

            // hajqasem (7)
            [7, 'hajqasem', 'totalLength', '11.0'],
            [7, 'hajqasem', 'range', '1400'],
            [7, 'hajqasem', 'weight', '7000'],
            [7, 'hajqasem', 'd', '0.9'],
            [7, 'hajqasem', 'wh_weight', '500'],
            [7, 'hajqasem', 'speed', 'Mach 12']
        ];

        for (const [mid, name, genName, val] of wsData) {
            await pool.query(
                'INSERT INTO weightandsize (missile_id, missile_name, generic_name, property_value, description, subject) VALUES (?, ?, ?, ?, ?, ?)',
                [mid, name, genName, val, genName, 'general']
            );
        }

        console.log('Restoration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Restoration failed:', err);
        process.exit(1);
    }
}
restore();
