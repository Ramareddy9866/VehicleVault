import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    serviceDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    mileage: {
        type: Number
    },
    nextServiceDate: {
        type: Date
    },
    nextServiceMileage: {
        type: Number
    },
    serviceType: {
        type: String,
        enum: [
            'Oil Change',
            'Brake Service',
            'Tire Rotation',
            'Battery Replacement',
            'Engine Diagnostics',
            'General Maintenance',
            'Others'
        ],
        required: true
    },
    serviceCenter: {
        name: String,
        address: String
    }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
