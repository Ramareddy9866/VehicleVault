import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }
  // Check password strength (min 8 chars, atleast one letter and one number)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 8 characters and include a number and a letter' })
  }
  try {
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const user = await User.create({ name, email, password })
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Make JWT token
const generateToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })
  } catch (error) {
    console.error('Error generating token:', error.message)
    throw new Error('Token generation failed')
  }
}

// Get current user info
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
    }
    res.json(userData)
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Forgot password (send reset email)
export const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(200)
        .json({ message: 'If an account exists for this email, a reset link has been sent.' })
    }
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.passwordResetToken = resetTokenHash
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour
    await user.save()
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
    await transporter.sendMail({
      from: `"VehicleVault" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset for your VehicleVault account.</p>
                   <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>If you did not request this, you can ignore this email.</p>`,
    })
    return res
      .status(200)
      .json({ message: 'If an account exists for this email, a reset link has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Failed to send reset email.' })
  }
}

// Reset user password
export const resetPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' })
  }

  // Check password strength
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 8 characters and include a number and a letter' })
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: Date.now() },
    })
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' })
    }
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
    res.status(200).json({ message: 'Password has been reset successfully.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Failed to reset password.' })
  }
}
