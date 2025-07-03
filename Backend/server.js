import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Add auth routes
app.use('/api/auth', authRoutes);

// Add vehicle routes
app.use('/api/vehicles', vehicleRoutes);

// Add service routes
app.use('/api/services', serviceRoutes);

// Add reminder routes
app.use('/api/reminders', reminderRoutes);

if (!process.env.MONGODB_URL) {
    console.error('Error: MONGODB_URL is not defined in .env file');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected');
    } catch(err) {
        console.error('MongoDB connection failed', err.message);
        process.exit(1);
    }
};

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
})
