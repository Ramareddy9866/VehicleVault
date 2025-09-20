import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleName: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    modelYear: {
        type: Number
    },
    lastReminderSentDate: {
        type: Date
    },
    serviceHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service'
        }
    ],
    preferredServiceCenter: {
        name: String,
        address: String,
        placeId: String
    },
    serviceCenterHistory: [
        {
            name: String,
            address: String,
            placeId: String,
            lastUsed: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
