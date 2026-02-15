
import pool from '../config/database';

async function restore() {
    try {
        console.log('Fixing weightandsize schema (PK/AI)...');
        try {
            await pool.query('ALTER TABLE weightandsize ADD PRIMARY KEY (idweightandsize)');
        } catch (e) { }
        await pool.query('ALTER TABLE weightandsize MODIFY idweightandsize INT NOT NULL AUTO_INCREMENT');

        console.log('Clearing old data...');
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('TRUNCATE weightandsize');
        await pool.query('TRUNCATE aerodynamic');
        await pool.query('TRUNCATE missiles');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Inserting real missiles...');
        // IDs match the original SQL file exactly
        await pool.query(`INSERT INTO missiles (id, name, type, num_of_stages, family_type, explosive_type, executive_summary_file_name, content_rv_file_name, content_bt_file_name, flight_logic_file_name, color, status, manufacturer, origin, description, mirv, maneuverable, decoys, nuclear_capable, hypersonic, terminal_maneuver, slv_capable) VALUES 
            (4, 'bulava', 'Ballistic', 4, 'missile', 'mirv', 'bulava.htm', 'bulava_Rv.htm', 'bulava_bt.htm', 'bulava_logic.htm', '#ff6b6b', 'Operational', 'Makeyev Design Bureau', 'Russia', 'Russian submarine-launched ballistic missile.', true, true, true, true, false, false, false),
            (5, 'emad', 'Ballistic', 1, 'missile', 'whole', 'emad.htm', 'emad_Rv.htm', 'emad_bt.htm', 'emad_logic.htm', '#4ecdc4', 'Operational', 'Iran', 'Iran', 'Iranian intermediate-range ballistic missile.', false, true, false, true, false, true, false),
            (6, 'shahed136', 'UAV', 1, 'UAV', 'cluster', 'shahed136.htm', 'shahed136_Rv.htm', 'shahed136_bt.htm', 'shahed136_logic.htm', '#45b7d1', 'Operational', 'HESA', 'Iran', 'Iranian loitering munition.', false, true, false, false, false, false, false),
            (7, 'hajqasem', 'Ballistic', 1, 'missile', 'whole', 'hajqasem.htm', 'hajqasem_Rv.htm', 'hajqasem_bt.htm', 'hajqasem_logic.htm', '#ff9f43', 'Operational', 'Iran', 'Iran', 'Iranian surface-to-surface ballistic missile.', false, true, false, false, true, false, false)`);

        console.log('Inserting weightandsize data...');
        // Data derived from createMySqlRobinDB.sql lines 700-762
        const wsData = [
            // bulava (4)
            [4, 'bulava', 'diameter', '2.0'],
            [4, 'bulava', 'length', '12.1'],
            [4, 'bulava', 'wh_weight', '701'],
            [4, 'bulava', 'launch_weight', '36.8'],
            [4, 'bulava', 'max_range', '9300'],
            [4, 'bulava', 'velocity', 'Mach 24'],
            [4, 'bulava', 'accuracy', '350'],
            [4, 'bulava', 'origin', 'Russia'],

            // emad (5)
            [5, 'emad', 'wh_weight', '750'],
            [5, 'emad', 'length', '15.5'],
            [5, 'emad', 'diameter', '1.25'],
            [5, 'emad', 'launch_weight', '17500'],
            [5, 'emad', 'max_range', '1700'],
            [5, 'emad', 'velocity', '2400 m/s'],

            // shahed136 (6)
            [6, 'shahed136', 'length', '3.5'],
            [6, 'shahed136', 'max_range', '2500'],
            [6, 'shahed136', 'launch_weight', '200'],
            [6, 'shahed136', 'velocity', '185 km/h'],

            // hajqasem (7)
            [7, 'hajqasem', 'length', '11.0'],
            [7, 'hajqasem', 'max_range', '1400'],
            [7, 'hajqasem', 'launch_weight', '7000'],
            [7, 'hajqasem', 'diameter', '0.9'],
            [7, 'hajqasem', 'wh_weight', '500'],
            [7, 'hajqasem', 'velocity', 'Mach 12']
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
