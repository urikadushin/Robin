
import pool from '../config/database';

const rcsImages = [
    { missile: 'bulava', path: 'BULAVA_RCS_1.png', part: 'UN' },
    { missile: 'bulava', path: 'BULAVA_RCS_2.png', part: 'RV' },
    { missile: 'bulava', path: 'BULAVA_RCS_3.png', part: 'BT' },
    { missile: 'emad', path: 'EMAD_RCS_1.png', part: 'UN' },
    { missile: 'emad', path: 'EMAD_RCS_2.png', part: 'RV' },
    { missile: 'emad', path: 'EMAD_RCS_3.png', part: 'BT' },
    { missile: 'shahed136', path: 'SHAHED136_RCS_1.png', part: 'UN' },
    { missile: 'hajqasem', path: 'HAJQASEM_RCS_1.png', part: 'UN', description: 'Radar Cross Section of the full assembly' },
    { missile: 'hajqasem', path: 'HAJQASEM_RCS_2.png', part: 'RV', description: 'Radar Cross Section of the re-entry vehicle' },
    { missile: 'hajqasem', path: 'HAJQASEM_RCS_3.png', part: 'BT', description: 'Radar Cross Section of the booster stage' },
];

async function seedRcsImages() {
    try {
        console.log('Seeding RCS images...');
        for (const img of rcsImages) {
            // Get missile_id
            const [missiles] = await pool.query('SELECT id FROM missiles WHERE name = ?', [img.missile]);
            if ((missiles as any[]).length > 0) {
                const missileId = (missiles as any[])[0].id;

                // Check if already exists
                const [existing] = await pool.query('SELECT * FROM images WHERE image_path = ? AND image_type = "rcs"', [img.path]);
                if ((existing as any[]).length === 0) {
                    console.log(`Inserting RCS image: ${img.path} for ${img.missile}`);
                    await pool.query(
                        'INSERT INTO images (missile_id, missile_name, part_name, image_type, image_path, image_description) VALUES (?, ?, ?, ?, ?, ?)',
                        [missileId, img.missile, img.part, 'rcs', img.path, img.description || `RCS scan of ${img.missile} ${img.part}`]
                    );
                } else {
                    console.log(`RCS image already exists: ${img.path}`);
                }
            } else {
                console.warn(`Missile not found for seeding RCS image: ${img.missile}`);
            }
        }
        console.log('RCS image seeding complete.');
    } catch (error) {
        console.error('Error seeding RCS images:', error);
    } finally {
        process.exit();
    }
}

seedRcsImages();
