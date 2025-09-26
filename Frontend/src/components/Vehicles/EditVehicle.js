// Edit vehicle details.
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Container, Paper, Typography, TextField, Button, 
         Grid, Box, CircularProgress } from '@mui/material'
import axios from 'axios'
import { useSnackbar } from '../../context/SnackbarContext'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import API_URL from '../../config'

const EditVehicle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    vehicleName: '',
    registrationNumber: '',
    modelYear: '',
  })
  const [loading, setLoading] = useState(true)
  const showSnackbar = useSnackbar()

    // Fetch the existing vehicle data on component mount
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`${API_URL}/vehicles/${id}`)
        const v = res.data
        setFormData({
          vehicleName: v.vehicleName || '',
          registrationNumber: v.registrationNumber || '',
          modelYear: v.modelYear || '',
        })
      } catch (e) {
        const msg = e.response?.data?.message || 'Failed to fetch vehicle data.'
        showSnackbar(msg, 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchVehicle()
  }, [id, showSnackbar])

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

    // Handles form submission for updating vehicle details
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await axios.put(`${API_URL}/vehicles/${id}`, {
        vehicleName: formData.vehicleName,
        registrationNumber: formData.registrationNumber,
        modelYear: formData.modelYear,
      })
      showSnackbar('Vehicle updated successfully!', 'success')
      navigate('/vehicles')
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to update vehicle. Please try again.'
      showSnackbar(msg, 'error')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
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
            Edit Vehicle
          </Typography>
        </Box>

        <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
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

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: { xs: 2, sm: 3 } }}
          >
            <Button
              variant="outlined" onClick={() => navigate('/vehicles')} sx={{ minWidth: 100 }} >
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>
              Update
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default EditVehicle;