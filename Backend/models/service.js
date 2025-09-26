import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    mileage: {
      type: Number,
    },
    nextServiceDate: {
      type: Date,
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
        'Others',
      ],
      required: true,
    },
    serviceCenter: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
)

serviceSchema.index({ vehicleId: 1, serviceDate: -1 })

const Service = mongoose.model('Service', serviceSchema)
export default Service
