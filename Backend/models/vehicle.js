import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleName: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    modelYear: {
      type: Number,
    },
    lastReminderSentDate: {
      type: Date,
    },
    preferredServiceCenter: {
      name: String,
      address: String,
    },
  },
  { timestamps: true }
)

// Index commonly queried fields
vehicleSchema.index({ userId: 1 })
vehicleSchema.index({ registrationNumber: 1 }, { unique: true })

const Vehicle = mongoose.model('Vehicle', vehicleSchema)
export default Vehicle
