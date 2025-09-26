import Service from '../models/service.js'
import Vehicle from '../models/vehicle.js'

// Add a new service for a vehicle
export const addService = async (req, res) => {
  const { serviceType, serviceDate, cost, description, mileage, nextServiceDate, serviceCenter } =
    req.body
  const { vehicleId } = req.params
  // Validate all required fields
  if (
    !serviceType ||
    !serviceDate ||
    !cost ||
    !description ||
    !serviceCenter?.name?.trim() ||
    !serviceCenter?.address?.trim()
  ) {
    return res
      .status(400)
      .json({
        message:
          'Service type, service date, cost, description, and service center details are required.',
      })
  }

  // Validate cost is a positive number
  if (typeof cost !== 'number' || cost <= 0) {
    return res.status(400).json({ message: 'Cost must be a positive number.' })
  }
  try {
    const vehicle = await Vehicle.findById(vehicleId)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' })
    }
    const service = await Service.create({
      vehicleId,
      serviceType,
      serviceDate,
      cost,
      description,
      mileage,
      nextServiceDate,
      serviceCenter,
    })
    res.status(201).json(service)
  } catch (error) {
    console.error('Error adding service:', error)
    res.status(500).json({ message: 'Failed to add service.' })
  }
}

// Get all services for a vehicle
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ vehicleId: req.params.vehicleId })
    res.status(200).json(services)
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve services.' })
  }
}

// Delete a service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' })
    }
    await service.deleteOne()
    res.status(200).json({ message: 'Service deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service.' })
  }
}
