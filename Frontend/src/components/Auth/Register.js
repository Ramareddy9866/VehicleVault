// User registration form.
import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Container, Box, Typography, TextField, Button, Link, Paper } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'
import { useSnackbar } from '../../context/SnackbarContext'

const Register = () => {
  // Form state management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const showSnackbar = useSnackbar()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }
  // Registration submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      showSnackbar('Passwords do not match', 'error')
      return
    }

    try {
      setLoading(true)
      await register(formData.name, formData.email, formData.password)
      navigate('/login')
      showSnackbar('Registration successful! Please sign in.', 'success')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
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
            Sign up
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: { xs: 1, sm: 1.5 } }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {'Already have an account? Sign In'}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Register
