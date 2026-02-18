import pool from '../config/database';

async function sanitizeImages() {
    console.log('Starting total Hebrew sanitization for images (with fixed regex)...');
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`SELECT idimages, missile_name, image_type, part_name, image_description FROM images`);
        const items = rows as any[];
        let updatedCount = 0;

        // Correct JS regex for Hebrew range: [\u0590-\u05FF]
        const hebrewRegex = /[\u0590-\u05FF]/;

        for (const item of items) {
            const desc = item.image_description || '';
            if (hebrewRegex.test(desc)) {
                const missile = item.missile_name || 'Threat';
                const type = item.image_type || 'Detail';
                const part = item.part_name || '';
                const newDesc = `${missile} ${type} ${part}`.trim().replace(/\s+/g, ' ');

                await connection.query(
                    `UPDATE images SET image_description = ? WHERE idimages = ?`,
                    [newDesc, item.idimages]
                );
                console.log(`[images] Sanitized ID ${item.idimages}: "${desc}" -> "${newDesc}"`);
                updatedCount++;
            }
        }

        connection.release();
        console.log(`Finished. Sanitized ${updatedCount} image descriptions.`);
    } catch (error) {
        console.error('Sanitization failed:', error);
    } finally {
        process.exit(0);
    }
}

sanitizeImages();
