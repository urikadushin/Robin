import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Static File Serving
const DATAROOT_PATH = 'C:/URI/ALUMA/dataroot';
app.use('/api/data/BtUnit', express.static(`${DATAROOT_PATH}/BtUnit`));
app.use('/api/data/RvUnit', express.static(`${DATAROOT_PATH}/RvUnit`));
app.use('/api/data/ExecutiveSummary', express.static(`${DATAROOT_PATH}/ExecutiveSummary`));
app.use('/api/data/Logic', express.static(`${DATAROOT_PATH}/Logic`));
app.use('/api/data/Trajectories', express.static(`${DATAROOT_PATH}/Trajectories`));
app.use('/api/data/Images', express.static(`${DATAROOT_PATH}/Images`));
app.use('/api/data/3DModel', express.static(`${DATAROOT_PATH}/3DModel`));
app.use('/api/data/Maps', express.static(`${DATAROOT_PATH}/Maps`));
app.use('/api/data/SDK', express.static(`${DATAROOT_PATH}/SDK`));

// Health Check
app.get('/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ status: 'error', database: 'disconnected', error: (error as Error).message });
    }
});

import missileRoutes from './routes/missileRoutes';
import aerodynamicRoutes from './routes/aerodynamicRoutes';
import weightAndSizeRoutes from './routes/weightAndSizeRoutes';
import fullMissileRoutes from './routes/fullMissileRoutes';

app.use('/api/missiles', missileRoutes);
app.use('/api/aerodynamics', aerodynamicRoutes);
app.use('/api/weightandsize', weightAndSizeRoutes);
app.use('/api/full-missile', fullMissileRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Force event loop to stay active
setInterval(() => {
    // Keep alive
    // Trigger restart
}, 60000);
