import Vehicle from '../models/vehicle.js'
import User from '../models/user.js'

// Add a new vehicle
export const addVehicle = async (req, res) => {
  const { vehicleName, registrationNumber, modelYear } = req.body
  if (!vehicleName || !registrationNumber) {
    return res.status(400).json({ message: 'All required fields must be provided.' })
  }
  try {
    const existingVehicle = await Vehicle.findOne({
      registrationNumber: registrationNumber,
      userId: req.user._id,
    })

    if (existingVehicle) {
      return res
        .status(400)
        .json({ message: 'A vehicle with this registration number already exists.' })
    }

    const vehicleData = {
      userId: req.user._id,
      vehicleName,
      registrationNumber,
    }
    if (modelYear) vehicleData.modelYear = modelYear
    const vehicle = await Vehicle.create(vehicleData)
    // Add vehicle to user's list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { vehicles: vehicle._id },
    })
    res.status(201).json(vehicle)
  } catch (error) {
    res.status(500).json({ message: 'Failed to add vehicle.' })
  }
}

// Get all vehicles for a user
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user._id })
    res.status(200).json(vehicles)
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve vehicles.' })
  }
}

// Get a vehicle by ID
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' })
    }
    res.status(200).json(vehicle)
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve vehicle.' })
  }
}

// Update a vehicle
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' })
    }
    const { vehicleName, registrationNumber, modelYear } = req.body
    if (!vehicleName || !registrationNumber) {
      return res.status(400).json({ message: 'All required fields must be provided.' })
    }
    vehicle.vehicleName = vehicleName
    vehicle.registrationNumber = registrationNumber
    if (modelYear === '' || modelYear === null || typeof modelYear === 'undefined') {
      vehicle.modelYear = undefined
    } else {
      vehicle.modelYear = modelYear
    }
    await vehicle.save()
    res.json(vehicle)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update vehicle.' })
  }
}

// Delete a vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' })
    }
    if (vehicle.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this vehicle.' })
    }
    await vehicle.deleteOne()
    res.status(200).json({ message: 'Vehicle deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete vehicle.' })
  }
}

// Set preferred service center for a vehicle
export const setPreferredCenter = async (req, res) => {
  const { vehicleId, name, address } = req.body
  if (!vehicleId) {
    return res.status(400).json({ message: 'Vehicle ID is required' })
  }
  try {
    // Only allow if the vehicle belongs to the logged-in user
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user._id })
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found or not owned by user' })
    }
    // Normalize inputs (treat undefined/null as empty strings)
    const nameTrimmed = typeof name === 'string' ? name.trim() : ''
    const addressTrimmed = typeof address === 'string' ? address.trim() : ''

    // If both fields are empty/whitespace, unset preferred center
    if (!nameTrimmed && !addressTrimmed) {
      vehicle.preferredServiceCenter = undefined
      await vehicle.save()
      return res.json({
        message: 'Preferred service center removed',
        preferredServiceCenter: null,
      })
    }

    // When setting a preferred center, require both non-empty
    if (!nameTrimmed) {
      return res.status(400).json({ message: 'Service center name cannot be empty.' })
    }
    if (!addressTrimmed) {
      return res.status(400).json({ message: 'Service center address cannot be empty.' })
    }

    // Update preferred service center ONLY (do not update history)
    vehicle.preferredServiceCenter = { name: nameTrimmed, address: addressTrimmed }
    await vehicle.save()
    res.json({
      message: 'Preferred service center updated',
      preferredServiceCenter: vehicle.preferredServiceCenter,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}
