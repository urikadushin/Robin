import { Request, Response } from 'express';
import pool from '../config/database';
import { FullMissileData } from '../models/FullMissileModel';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const saveFullMissile = async (req: Request, res: Response) => {
    const { missile, aerodynamics, weightAndSize, engine, capability, performance, rcs, massProperties, images, launchAreaAssociations } = req.body as FullMissileData;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Save Basic Missile Info
        let missileId: number;
        if (missile.id) {
            await connection.query(
                'UPDATE missiles SET name = ?, type = ?, num_of_stages = ?, family_type = ?, explosive_type = ?, description = ?, status = ?, year = ?, manufacturer = ?, color = ?, content_rv_file_name = ? WHERE id = ?',
                [missile.name, missile.type, missile.num_of_stages, missile.family_type, missile.explosive_type, missile.description, missile.status, missile.year, missile.manufacturer, missile.color, missile.content_rv_file_name, missile.id]
            );
            missileId = missile.id;
        } else {
            const [result] = await connection.query<ResultSetHeader>(
                'INSERT INTO missiles (name, type, num_of_stages, family_type, explosive_type, description, status, year, manufacturer, color, content_rv_file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [missile.name, missile.type, missile.num_of_stages, missile.family_type, missile.explosive_type, missile.description, missile.status, missile.year, missile.manufacturer, missile.color, missile.content_rv_file_name]
            );
            missileId = result.insertId;
        }

        // 2. Clear and Re-populate related tables
        const missileIdRef = missileId;

        // Weight and Size
        try {
            await connection.query('DELETE FROM weightandsize WHERE missile_id = ?', [missileIdRef]);
            if (weightAndSize && weightAndSize.length > 0) {
                for (const item of weightAndSize) {
                    await connection.query(
                        'INSERT INTO weightandsize (missile_id, missile_name, description, generic_name, property_value, sign, unit, subject) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [missileIdRef, missile.name, item.description, item.generic_name, item.property_value, item.sign, item.unit, item.subject]
                    );
                }
            }
        } catch (err: any) {
            console.error('Error saving weightandsize:', err.message);
            throw err;
        }

        // Aerodynamics
        try {
            await connection.query('DELETE FROM aerodynamic WHERE missile_id = ?', [missileIdRef]);
            if (aerodynamics && aerodynamics.length > 0) {
                for (const item of aerodynamics) {
                    await connection.query(
                        'INSERT INTO aerodynamic (missile_id, missile_name, part_name, aero_cx0_on, aero_cx0_off, aero_cna, aero_xcp, aero_cmq, aero_cnd, aero_clp, aero_cl, dim, mach_vec, alpha_vec) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [missileIdRef, missile.name, item.part_name, item.aero_cx0_on, item.aero_cx0_off, item.aero_cna, item.aero_xcp, item.aero_cmq, item.aero_cnd, item.aero_clp, item.aero_cl, item.dim, item.mach_vec, item.alpha_vec]
                    );
                }
            }
        } catch (err: any) {
            console.error('Error saving aerodynamic:', err.message);
            throw err;
        }

        // Engine
        try {
            await connection.query('DELETE FROM engine WHERE missile_id = ?', [missileIdRef]);
            if (engine) {
                await connection.query(
                    'INSERT INTO engine (missile_id, missile_name, type, isp0, tburn, thrust, mass_propelant, thrust_profile_file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [missileIdRef, missile.name, engine.type, engine.isp0, engine.tburn, engine.thrust, engine.mass_propelant, engine.thrust_profile_file_name]
                );
            }
        } catch (err: any) {
            console.error('Error saving engine:', err.message);
            throw err;
        }

        // Capability
        try {
            await connection.query('DELETE FROM capability WHERE missile_id = ?', [missileIdRef]);
            if (capability) {
                await connection.query(
                    'INSERT INTO capability (missile_id, missile_name, is_burning_debris, is_decoy, is_debris, acs_algorithm, is_lofted) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [missileIdRef, missile.name, capability.is_burning_debris, capability.is_decoy, capability.is_debris, capability.acs_algorithm, capability.is_lofted]
                );
            }
        } catch (err: any) {
            console.error('Error saving capability:', err.message);
            throw err;
        }

        // Performance and RCS
        try {
            await connection.query('DELETE FROM rcs WHERE perf_id IN (SELECT perfIndex FROM performance WHERE missile_id = ?)', [missileIdRef]);
            await connection.query('DELETE FROM performance WHERE missile_id = ?', [missileIdRef]);

            if (performance && performance.length > 0) {
                for (const item of performance) {
                    const [perfResult] = await connection.query<ResultSetHeader>(
                        'INSERT INTO performance (missile_id, missile_name, rng, trajType, launchAngle, angleEndOfBurn, timeEndOfBurn, velEndOfBurn, separationTime, separationAlt, separationVel, apogeeAlt, apogeeVel, timeOfFlight, hitVel, hitAngle, trajectoryRvPath, trajectoryBtPath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [missileIdRef, missile.name, item.rng, item.trajType, item.launchAngle, item.angleEndOfBurn, item.timeEndOfBurn, item.velEndOfBurn, item.separationTime, item.separationAlt, item.separationVel, item.apogeeAlt, item.apogeeVel, item.timeOfFlight, item.hitVel, item.hitAngle, item.trajectoryRvPath, item.trajectoryBtPath]
                    );

                    const perfId = perfResult.insertId;

                    if (rcs && rcs.length > 0) {
                        const matchingRcs = rcs.filter(r => r.perf_id === item.perfIndex);
                        for (const r of matchingRcs) {
                            await connection.query(
                                'INSERT INTO rcs (frequency, rcs_type, radars, source, perf_id) VALUES (?, ?, ?, ?, ?)',
                                [r.frequency, r.rcs_type, r.radars, r.source, perfId]
                            );
                        }
                    }
                }
            }
        } catch (err: any) {
            console.error('Error saving performance/rcs:', err.message);
            throw err;
        }

        // Mass Properties
        try {
            await connection.query('DELETE FROM massmomentandxcg WHERE missile_id = ?', [missileIdRef]);
            if (massProperties && massProperties.length > 0) {
                for (const item of massProperties) {
                    await connection.query(
                        'INSERT INTO massmomentandxcg (missile_id, missile_name, description, launch_value, eob_value, sign, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [missileIdRef, missile.name, item.description, item.launch_value, item.eob_value, item.sign, item.unit]
                    );
                }
            }
        } catch (err: any) {
            console.error('Error saving massmomentandxcg:', err.message);
            throw err;
        }

        // Images
        try {
            await connection.query('DELETE FROM images WHERE missile_id = ?', [missileIdRef]);
            if (images && images.length > 0) {
                for (const img of images) {
                    await connection.query(
                        'INSERT INTO images (missile_id, missile_name, part_name, image_type, image_path, image_description) VALUES (?, ?, ?, ?, ?, ?)',
                        [missileIdRef, missile.name, img.part_name, img.image_type, img.image_path, img.image_description]
                    );
                }
            }
        } catch (err: any) {
            console.error('Error saving images:', err.message);
            throw err;
        }

        // Launch Area Associations
        try {
            await connection.query('DELETE FROM missilelaunchassociation WHERE missile_id = ?', [missileIdRef]);
            if (launchAreaAssociations && launchAreaAssociations.length > 0) {
                for (const assoc of launchAreaAssociations) {
                    await connection.query(
                        'INSERT INTO missilelaunchassociation (missile_id, missile_name, launch_area_id) VALUES (?, ?, ?)',
                        [missileIdRef, missile.name, assoc.launch_area_id]
                    );
                }
            }
        } catch (err: any) {
            console.error('Error saving missilelaunchassociation:', err.message);
            throw err;
        }

        await connection.commit();
        res.json({ success: true, missileId });

    } catch (error: any) {
        await connection.rollback();
        console.error('Transaction rolled back due to error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const getFullMissile = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [missiles] = await pool.query<RowDataPacket[]>(`SELECT * FROM missiles WHERE id = ?`, [id]);
        if (missiles.length === 0) return res.status(404).json({ error: 'Missile not found' });

        const missile = missiles[0];
        const [weightAndSize] = await pool.query<RowDataPacket[]>(`SELECT * FROM weightandsize WHERE missile_id = ?`, [id]);
        const [aerodynamics] = await pool.query<RowDataPacket[]>(`SELECT * FROM aerodynamic WHERE missile_id = ?`, [id]);
        const [engines] = await pool.query<RowDataPacket[]>(`SELECT * FROM engine WHERE missile_id = ?`, [id]);
        const [capabilities] = await pool.query<RowDataPacket[]>(`SELECT * FROM capability WHERE missile_id = ?`, [id]);
        const [performance] = await pool.query<RowDataPacket[]>(`SELECT * FROM performance WHERE missile_id = ?`, [id]);
        const [massProperties] = await pool.query<RowDataPacket[]>(`SELECT * FROM massmomentandxcg WHERE missile_id = ?`, [id]);
        const [images] = await pool.query<RowDataPacket[]>(`SELECT * FROM images WHERE missile_id = ?`, [id]);
        const [launchAreaAssociations] = await pool.query<RowDataPacket[]>(`SELECT * FROM missilelaunchassociation WHERE missile_id = ?`, [id]);

        // Fetch RCS for each performance entry
        const performanceWithRcs = await Promise.all(performance.map(async (p) => {
            const [rcs] = await pool.query<RowDataPacket[]>(`SELECT * FROM rcs WHERE perf_id = ?`, [p.perfIndex]);
            return { ...p, rcs };
        }));

        res.json({
            missile,
            weightAndSize,
            aerodynamics,
            engine: engines[0] || null,
            capability: capabilities[0] || null,
            performance: performanceWithRcs,
            massProperties,
            images,
            launchAreaAssociations
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
