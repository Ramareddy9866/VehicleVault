import Service from '../models/service.js';
import Vehicle from '../models/vehicle.js';

// Add a new service for a vehicle
export const addService = async (req, res) => {
    const { serviceType, serviceDate, cost, description, mileage, nextServiceDate, nextServiceMileage, serviceCenter } = req.body;
    const { vehicleId } = req.params;
    if (!serviceType || !serviceDate) {
        return res.status(400).json({ message: 'Service type and service date are required.' });
    }
    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }
        const service = await Service.create({
            vehicleId,
            serviceType,
            serviceDate,
            cost,
            description,
            mileage,
            nextServiceDate,
            nextServiceMileage,
            serviceCenter
        });
        await Vehicle.findByIdAndUpdate(vehicleId, { lastServiceDate: serviceDate });
        if (nextServiceDate) {
            await Vehicle.findByIdAndUpdate(vehicleId, { nextServiceDate });
        }
        if (serviceCenter && serviceCenter.name) {
            const vehicleToUpdate = await Vehicle.findById(vehicleId);
            let history = vehicleToUpdate.serviceCenterHistory || [];
            // Remove duplicate center
            history = history.filter(center => 
                center.name !== serviceCenter.name || 
                center.address !== serviceCenter.address
            );
            // Add new entry at the beginning
            history.unshift({
                name: serviceCenter.name,
                address: serviceCenter.address,
                placeId: serviceCenter.placeId || null,
                lastUsed: new Date()
            });
            // Keep only last 10 entries
            history = history.slice(0, 10);
            await Vehicle.findByIdAndUpdate(vehicleId, { 
                serviceCenterHistory: history 
            });
        }
        res.status(201).json(service);
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ message: 'Failed to add service.' });
    }
};

// Get all services for a vehicle
export const getServices = async (req, res) => {
    try {
        const services = await Service.find({ vehicleId: req.params.vehicleId });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve services.' });
    }
};

// Delete a service
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        await service.deleteOne();
        res.status(200).json({ message: 'Service deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete service.' });
    }
};
