import Vehicle from '../models/vehicle.js';
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

// Send reminders for upcoming service dates
export const sendReminders = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({
            userId: req.user._id,
            nextServiceDate: {
                $gte: today,
                $lte: nextWeek
            }
        });
        if (vehicles.length === 0) {
            return res.status(200).json({ message: 'No reminders needed this week.' });
        }
        // Send email reminders
        const emailPromises = vehicles.map(vehicle =>
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
