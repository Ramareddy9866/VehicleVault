import Vehicle from '../models/vehicle.js';
import Service from '../models/service.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Error: EMAIL_USER or EMAIL_PASS is not defined in .env file');
    process.exit(1);
}

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

// Helper function to calculate next service date from service records
const getNextServiceDate = async (vehicleId) => {
    const services = await Service.find({ vehicleId });
    const today = new Date();
    
    const futureNextDates = services
        .map(s => s.nextServiceDate)
        .filter(d => d && new Date(d) > today)
        .sort((a, b) => new Date(a) - new Date(b));
    
    return futureNextDates.length > 0 ? futureNextDates[0] : null;
};

// Send reminders for upcoming service dates
export const sendReminders = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ userId: req.user._id });
        if (vehicles.length === 0) {
            return res.status(200).json({ message: 'No vehicles found.' });
        }
        
        // Check each vehicle for upcoming service dates
        const vehiclesNeedingReminders = [];
        for (const vehicle of vehicles) {
            const nextServiceDate = await getNextServiceDate(vehicle._id);
            if (nextServiceDate && nextServiceDate >= today && nextServiceDate <= nextWeek) {
                vehiclesNeedingReminders.push({ ...vehicle.toObject(), nextServiceDate });
            }
        }
        
        if (vehiclesNeedingReminders.length === 0) {
            return res.status(200).json({ message: 'No reminders needed this week.' });
        }
        
        // Send email reminders
        const emailPromises = vehiclesNeedingReminders.map(vehicle =>
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: req.user.email,
                subject: 'Vehicle Service Reminder',
                text: `Reminder: Your vehicle "${vehicle.vehicleName}" is due for service on ${vehicle.nextServiceDate.toDateString()}.`
            })
        );
        await Promise.all(emailPromises);
        res.status(200).json({ message: 'Reminders sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reminders.' });
    }
};
