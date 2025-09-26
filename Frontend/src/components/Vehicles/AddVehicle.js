// Add a new vehicle.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Container, Paper, Typography, Grid, TextField, Button, Box } from '@mui/material'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import API_URL from '../../config'
import { useSnackbar } from '../../context/SnackbarContext'

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    vehicleName: '',
    registrationNumber: '',
    modelYear: '',
  })

  const showSnackbar = useSnackbar()
  const navigate = useNavigate()

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

    // Handler for form submission
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/vehicles`, formData)
      navigate('/vehicles', { state: { vehicleAdded: true } })
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add vehicle.'
      showSnackbar(msg, 'error')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper
        elevation={3}
        sx={{ p: { xs: 2, sm: 4 }, mt: { xs: 2, sm: 4 }, width: '100%', maxWidth: 500 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <DirectionsCarFilledIcon
            sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main', mr: 1 }}
          />
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              textTransform: 'uppercase',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Add Vehicle
          </Typography>
        </Box>

        <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
          {/* Vehicle Name Field */}
          <Grid item xs={12}>
            <TextField
              label="Vehicle Name"
              name="vehicleName"
              value={formData.vehicleName}
              onChange={handleChange}
              required
              fullWidth
              size="small"
            />
          </Grid>
          {/* Registration Number Field */}
          <Grid item xs={12}>
            <TextField
              label="Registration Number"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
              fullWidth
              size="small"
            />
          </Grid>
          {/* Model Year Field */}
          <Grid item xs={12} sm={6} md={5} sx={{ mx: 'auto' }}>
            <TextField
              label="Model Year"
              name="modelYear"
              type="number"
              value={formData.modelYear}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Grid>
          {/* Action Buttons */}
          <Grid
            item
            xs={12}
            sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: { xs: 2, sm: 3 } }}
          >
            <Button variant="outlined" onClick={() => navigate('/vehicles')} sx={{ minWidth: 100 }} >
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>
              Add Vehicle
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default AddVehicle;