import Vehicle from '../models/vehicle.js';
import User from '../models/user.js';

// Add a new vehicle
export const addVehicle = async (req, res) => {
    const { vehicleName, registrationNumber, modelYear } = req.body;
    if (!vehicleName || !registrationNumber) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }
    try {
        const vehicleData = {
            userId: req.user._id,
            vehicleName,
            registrationNumber
        };
        if (modelYear) vehicleData.modelYear = modelYear;
        const vehicle = await Vehicle.create(vehicleData);
        // Add vehicle to user's list
        await User.findByIdAndUpdate(req.user._id, {
            $push: { vehicles: vehicle._id }
        });
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add vehicle.' });
    }
};

// Get all vehicles for a user
export const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ userId: req.user._id });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve vehicles.' });
    }
};

// Get a vehicle by ID
export const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve vehicle.' });
    }
}

// Update a vehicle
export const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }
        const { vehicleName, registrationNumber, modelYear } = req.body;
        if (!vehicleName || !registrationNumber) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }
        vehicle.vehicleName = vehicleName;
        vehicle.registrationNumber = registrationNumber;
        if (modelYear === '' || modelYear === null || typeof modelYear === 'undefined') {
            vehicle.modelYear = undefined;
        } else {
            vehicle.modelYear = modelYear;
        }
        await vehicle.save();
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update vehicle.' });
    }
};

// Delete a vehicle
export const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }
        if (vehicle.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this vehicle.' });
        }
        await vehicle.deleteOne();
        res.status(200).json({ message: 'Vehicle deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete vehicle.' });
    }
};

// Set preferred service center for a vehicle
export const setPreferredCenter = async (req, res) => {
    const { vehicleId, name, address, placeId } = req.body;
    if (!vehicleId) {
        return res.status(400).json({ message: 'Vehicle ID is required' });
    }
    try {
        // Only allow if the vehicle belongs to the logged-in user
        const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user._id });
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found or not owned by user' });
        }
        // If all fields are empty/null, unset preferred center
        if (!name && !address && !placeId) {
            vehicle.preferredServiceCenter = undefined;
            await vehicle.save();
            return res.json({
                message: 'Preferred service center removed',
                preferredServiceCenter: null,
                serviceCenterHistory: vehicle.serviceCenterHistory
            });
        }
        // Update preferred service center ONLY (do not update history)
        vehicle.preferredServiceCenter = { name, address, placeId };
        await vehicle.save();
        res.json({ 
          message: 'Preferred service center updated', 
          preferredServiceCenter: vehicle.preferredServiceCenter,
          serviceCenterHistory: vehicle.serviceCenterHistory
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
