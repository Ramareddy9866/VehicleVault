// Reset password form.
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import axios from 'axios'
import API_URL from '../../config'
import { useSnackbar } from '../../context/SnackbarContext'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const showSnackbar = useSnackbar()
  const [loading, setLoading] = useState(false)

  // Handle password reset submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      showSnackbar('Please enter and confirm your new password.', 'error')
      return
    }
    if (password !== confirmPassword) {
      showSnackbar('Passwords do not match.', 'error')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API_URL}/auth/reset-password/${token}`, { password })
      const msg = 'Password reset successful! You can now log in.'
      showSnackbar(msg, 'success')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password.'
      showSnackbar(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: { xs: '100%', sm: 400 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Reset Password
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: { xs: 1, sm: 1.5 } }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default ResetPassword
