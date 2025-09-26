import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Paper, Typography, Button, Box, CircularProgress, Grid, useTheme, IconButton, Divider, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

import { Delete as DeleteIcon } from '@mui/icons-material'
import axios from 'axios'
import AddIcon from '@mui/icons-material/Add'
import { useSnackbar } from '../../context/SnackbarContext'
import API_URL from '../../config'
import { formatDateDDMMYY } from '../../utils'
import SelectField from '../common/SelectField'

const ServiceHistory = () => {
  const { id: vehicleId } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [serviceToDelete, setServiceToDelete] = useState(null) 
  const showSnackbar = useSnackbar()

    // Fetch service history for the current vehicle
  useEffect(() => {
    if (!vehicleId) {
      showSnackbar('Invalid vehicle ID. Please try again.', 'error')
      setLoading(false)
      return
    }
    const fetchData = async () => {
      try {
        const servicesRes = await axios.get(`${API_URL}/services/${vehicleId}`)
        setServices(servicesRes.data)
      } catch (err) {
        console.error('Error fetching data:', err)
        showSnackbar(
          err.response?.data?.message || 'Failed to fetch service history. Please try again.','error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [vehicleId, showSnackbar])

    // Fetch all vehicles for the select field
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${API_URL}/vehicles`)
        setVehicles(response.data)
      } catch (err) {
        setVehicles([])
      }
    }
    fetchVehicles()
  }, [])

    // Handle service deletion
  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return

    try {
      await axios.delete(`${API_URL}/services/${serviceToDelete}`)
      setServices((prev) => prev.filter((s) => s._id !== serviceToDelete))
      showSnackbar('Service deleted successfully!', 'success')
    } catch (error) {
      console.error('Failed to delete service:', error)
      showSnackbar('Failed to delete service.', 'error')
    } finally {
      setServiceToDelete(null) 
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 1, sm: 0 }, mb: 4, px: { xs: 1, sm: 2 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: { xs: 2, sm: 3 },
          mt: 0,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            textTransform: 'uppercase',
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          Service History
        </Typography>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            mb: 2,
          }}
        >
         {/* Vehicle selector */}
          <SelectField
            label="Select Vehicle"
            value={vehicleId || ''}
            onChange={(e) => navigate(`/vehicles/${e.target.value}/service-history`)}
            options={vehicles.map((v) => ({
              value: v._id,
              label: `${v.vehicleName} (${v.registrationNumber})`,
            }))}
            size="small"
            sx={{
              width: { xs: '100%', sm: 240 },
              minHeight: { xs: 48, sm: 36 },
              '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 36 } },
            }}
          />
         {/* Add service button */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/vehicles/${vehicleId}/add-service`)}
            sx={{
              height: { xs: 48, sm: 36 },
              width: { xs: '100%', sm: 200 },
              minWidth: 0,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              p: { xs: '12px 16px', sm: 0 },
            }}
            size="small"
            startIcon={<AddIcon />}
          >
            Add Service
          </Button>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {services.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
              <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                No service records found
              </Typography>
            </Box>
          </Grid>
        )}
        {/* Service record cards */}
        {services.map((service) => (
          <Grid item xs={12} sm={6} lg={4} key={service._id}>
            <Paper
              elevation={3}
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderRadius: 2,
                boxShadow: 3,
                p: { xs: 2, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                position: 'relative',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-4px) scale(1.02)' },
                  boxShadow: { xs: 3, sm: 6 },
                },
              }}
            >
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: { xs: 4, sm: 8 },
                  right: { xs: 4, sm: 8 },
                  minWidth: { xs: 32, sm: 'auto' },
                  minHeight: { xs: 32, sm: 'auto' },
                }}
                onClick={() => setServiceToDelete(service._id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>

              {/* Service header */}
              <Box sx={{ mb: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }} >
                  {formatDateDDMMYY(service.serviceDate)}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: 'accent.main',
                    mt: 0.5,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  {service.serviceType || 'Service Type'}
                </Typography>
              </Box>

              {/* Description */}
              <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Description:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.4, wordBreak: 'break-word' }}
                >
                  {service.description || 'No description provided.'}
                </Typography>
              </Box>

              {/* Cost and Mileage */}
              <Box
                sx={{
                  mt: { xs: 1, sm: 2 },
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 1 },
                  justifyContent: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    Cost:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.success.main, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    {typeof service.cost === 'number' && !isNaN(service.cost) ? `₹${service.cost.toFixed(2)}` : 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center',  mx: 1 }} >
                  <Divider orientation="vertical" flexItem sx={{ borderColor: '#bbb', height: 24 }} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    Mileage:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    {typeof service.mileage === 'number' && !isNaN(service.mileage)
                      ? `${service.mileage.toLocaleString()} miles`
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ borderTop: '1px dashed #ccc', my: { xs: 1.5, sm: 2 } }} />
              {/* Service Center */}
              <Box sx={{ mb: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Service Center:
                </Typography>
                {service.serviceCenter?.name ? (
                  <Box sx={{ lineHeight: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        color: 'accent.main',
                        lineHeight: 1.2,
                        m: 0,
                        textAlign: 'center',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                    >
                      {service.serviceCenter.name}
                    </Typography>
                    {service.serviceCenter.address && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          lineHeight: 1.2,
                          m: 0,
                          mt: 0.5,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          textAlign: 'center',
                          wordBreak: 'break-word',
                        }}
                      >
                        {service.serviceCenter.address}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, textAlign: 'center' }}
                  >
                    Not specified
                  </Typography>
                )}
              </Box>

              {/* Next Service Date */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Next Service:
                </Typography>
                {service.nextServiceDate ? (
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, textAlign: 'center' }}
                  >
                    {formatDateDDMMYY(service.nextServiceDate)}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, textAlign: 'center' }}
                  >
                    N/A
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: { mx: { xs: 2, sm: 'auto' }, width: { xs: 'calc(100% - 32px)', sm: 'auto' } },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} >
            Are you sure you want to delete this service record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button
            onClick={() => setServiceToDelete(null)}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ServiceHistory
