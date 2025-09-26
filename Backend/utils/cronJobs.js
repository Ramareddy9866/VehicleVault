import cron from 'node-cron'
import Vehicle from '../models/vehicle.js'
import Service from '../models/service.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Helper function to calculate next service date from service records
const getNextServiceDate = async (vehicleId) => {
  const services = await Service.find({ vehicleId })
  const today = new Date()

  const futureNextDates = services
    .map((s) => s.nextServiceDate)
    .filter((d) => d && new Date(d) > today)
    .sort((a, b) => new Date(a) - new Date(b))

  return futureNextDates.length > 0 ? futureNextDates[0] : null
}

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Cron Job - Run every day at 6:00 am
cron.schedule('0 6 * * *', async () => {
  console.log('🔔 Running Reminder System...')

  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  try {
    // Get all vehicles and calculate their next service dates
    const vehicles = await Vehicle.find({}).populate('userId', 'email')

    if (vehicles.length === 0) {
      console.log('✅ No reminders needed at this time.')
      return
    }

    const emailPromises = vehicles.map(async (vehicle) => {
      // Calculate next service date from service records
      const nextServiceDate = await getNextServiceDate(vehicle._id)

      // Only send if there's a next service date within the reminder window
      if (nextServiceDate && nextServiceDate >= today && nextServiceDate <= nextWeek) {
        // Only send if not already sent for this nextServiceDate
        if (
          !vehicle.lastReminderSentDate ||
          vehicle.lastReminderSentDate.getTime() !== nextServiceDate.getTime()
        ) {
          await transporter.sendMail({
            from: `"VehicleVault" <${process.env.EMAIL_USER}>`,
            to: vehicle.userId.email,
            subject: '🚗 Upcoming Vehicle Service Reminder',
            html: `
                            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                                <h2 style="color: #4CAF50;">🚨 Service Reminder Alert!</h2>
                                <p>
                                    Dear User,<br/><br/>
                                    This is a friendly reminder that your vehicle <strong>${vehicle.vehicleName}</strong>
                                    (Registration No: <strong>${vehicle.registrationNumber}</strong>) is due for its next service on:
                                </p>
                                <h3 style="color: #2196F3;">${nextServiceDate.toDateString()}</h3>
                                <p>
                                    Regular maintenance helps keep your car running smoothly and reliably.<br/>
                                    Please ensure your vehicle is serviced on or before the due date.
                                </p>
                                <hr style="border: 0; height: 1px; background-color: #ddd;">
                                <p style="font-size: 12px; color: #aaa;">
                                    © ${new Date().getFullYear()} VehicleVault. All rights reserved.
                                </p>
                            </div>
                        `,
          })
          // Mark reminder as sent for this nextServiceDate
          vehicle.lastReminderSentDate = nextServiceDate
          await vehicle.save()
        }
      }
    })

    await Promise.all(emailPromises)

    console.log('✅ Reminders sent successfully!')
  } catch (error) {
    console.error('❌ Error sending reminders:', error.message)
  }
})
