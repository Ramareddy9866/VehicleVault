import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Container, Grid, Card, CardContent, Typography, Button, IconButton, Box, Chip, Menu,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import BuildIcon from '@mui/icons-material/Build'
import HistoryIcon from '@mui/icons-material/History'
import axios from 'axios'
import { useSnackbar } from '../../context/SnackbarContext'
import API_URL from '../../config'
import { formatDateDDMMYY, getServiceStatus } from '../../utils'

function VehicleCard({ vehicle, services, onEdit, onDelete, onMenuOpen }) {
    // Determine the most recent service date
  let previousServiceDate = null
  if (services.length > 0) {
    previousServiceDate = services
      .map((s) => s.serviceDate)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0]
  }
    // Determine the nearest future next service date
  let nextServiceDate = null
  const today = new Date()
  const futureNextDates = services
    .map((s) => s.nextServiceDate)
    .filter((d) => d && new Date(d) > today)
    .sort((a, b) => new Date(a) - new Date(b))
  if (futureNextDates.length > 0) {
    nextServiceDate = futureNextDates[0]
  }
  let serviceStatus = getServiceStatus(nextServiceDate)

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 3,
        borderRadius: 2,
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-4px) scale(1.02)' },
          boxShadow: { xs: 3, sm: 6 },
        },
        minHeight: { xs: 200, sm: 220 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
          <DirectionsCarIcon
            sx={{
              fontSize: { xs: 32, sm: 40 },
              mr: { xs: 1, sm: 2 },
              color: 'primary.main',
              flexShrink: 0,
            }}
          />
         {/* Vehicle Name and Reg Number */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: 'text.primary',
                fontSize: { xs: '0.875rem', sm: '1.25rem' },
                fontWeight: 'bold',
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}
            >
              {vehicle.vehicleName}
              {vehicle.modelYear ? ` (${vehicle.modelYear})` : ''}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 0.25 }}
            >
              {vehicle.registrationNumber}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => onMenuOpen(e, vehicle._id)}
            sx={{ color: 'text.secondary', minWidth: { xs: 32, sm: 'auto' }, minHeight: { xs: 32, sm: 'auto' }}}
          >
            <MoreVertIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
          </IconButton>
        </Box>

        {/* Previous Service Date */}
        <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
          >
            Previous Service Date:
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.primary', fontSize: { xs: '0.8rem', sm: '1rem' }, fontWeight: 500 }}
          >
            {formatDateDDMMYY(previousServiceDate)}
          </Typography>
        </Box>

        {/* Next Service Date */}
        <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
          >
            Next Service Date:
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.primary', fontSize: { xs: '0.8rem', sm: '1rem' }, fontWeight: 500}}
          >
            {formatDateDDMMYY(nextServiceDate)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: { xs: 1, sm: 1 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'flex-start' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {serviceStatus.label !== 'N/A' && (
              <Chip
                label={serviceStatus.label}
                color={serviceStatus.color}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 32 },
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: { xs: 0.5, sm: 0 },
            }}
          >
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: 'secondary.main', minWidth: { xs: 32, sm: 'auto' }, minHeight: { xs: 32, sm: 'auto' } }}
            >
              <EditIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{ color: 'accent.main', minWidth: { xs: 32, sm: 'auto' }, minHeight: { xs: 32, sm: 'auto' }}}
            >
              <DeleteIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
// Menu for service-related actions (Add Service, Service History).
function ServiceMenu({ anchorEl, open, onClose, onAddService, onHistory }) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem
        onClick={onAddService}
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          fontSize: { xs: '0.875rem', sm: '1rem' },
          py: { xs: 1, sm: 1.5 },
          '&:hover': { bgcolor: 'primary.light', color: 'primary.dark' },
        }}
      >
        <BuildIcon sx={{ mr: 1,fontSize: { xs: 18, sm: 20 } }} /> Add Service
      </MenuItem>
      <MenuItem
        onClick={onHistory}
        sx={{
          color: 'secondary.main',
          fontWeight: 500,
          fontSize: { xs: '0.875rem', sm: '1rem' },
          py: { xs: 1, sm: 1.5 },
          '&:hover': { bgcolor: 'secondary.light', color: 'secondary.dark' },
        }}
      >
        <HistoryIcon sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} /> Service History
      </MenuItem>
    </Menu>
  )
}

const VehicleList = () => {
  const [vehicles, setVehicles] = useState(null)
  const [servicesByVehicle, setServicesByVehicle] = useState({})
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, vehicleId: null })
  const [menuAnchor, setMenuAnchor] = useState({ open: false, vehicleId: null, element: null })
  const navigate = useNavigate()
  const showSnackbar = useSnackbar()
  const location = useLocation()

    // Function to fetch all vehicles and their corresponding services
  const fetchVehicles = async () => {
    try {
      // 1. Fetch all vehicles
      const response = await axios.get(`${API_URL}/vehicles`)
      const servicesObj = {}
      // 2. Fetch service history for each vehicle 
      await Promise.all(
        response.data.map(async (vehicle) => {
          try {
            const res = await axios.get(`${API_URL}/services/${vehicle._id}`)
            servicesObj[vehicle._id] = res.data
          } catch (err) {
            servicesObj[vehicle._id] = []
          }
        })
      )
      // 3. Update state
      setVehicles(response.data)
      setServicesByVehicle(servicesObj)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    if (location.state && location.state.vehicleAdded) {
      showSnackbar('Vehicle added successfully!', 'success')
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, showSnackbar, navigate, location.pathname])

    // Confirmed vehicle deletion
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/vehicles/${deleteDialog.vehicleId}`)
      setDeleteDialog({ open: false, vehicleId: null })
      fetchVehicles()
      showSnackbar('Vehicle deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      showSnackbar('Failed to delete vehicle. Please try again.', 'error')
    }
  }
  // Handle opening the service menu for a specific vehicle
  const handleMenuOpen = (event, vehicleId) => {
    setMenuAnchor({ open: true, vehicleId, element: event.currentTarget })
  }
  // Handle closing the service menu
  const handleMenuClose = () => {
    setMenuAnchor({ open: false, vehicleId: null, element: null })
  }
  // Handle navigation from the service menu
  const handleServiceAction = (action) => {
    const vehicleId = menuAnchor.vehicleId
    handleMenuClose()
    if (action === 'add') {
      navigate(`/vehicles/${vehicleId}/add-service`)
    } else if (action === 'history') {
      navigate(`/vehicles/${vehicleId}/service-history`)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: { xs: 3, sm: 4 },
          mt: { xs: 1, sm: 0 },
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            mb: { xs: 2, sm: 1 },
            textTransform: 'uppercase',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          Vehicle Collection
        </Typography>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'flex-end' },
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            onClick={() => navigate('/add-vehicle')}
            sx={{
              minHeight: { xs: 44, sm: 36 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 3, sm: 2 },
            }}
          >
            Add Vehicle
          </Button>
        </Box>
      </Box>
       {/* Vehicle Cards Grid */}
      <Box sx={{ minHeight: { xs: 300, sm: 360 } }}>
        {loading || vehicles === null ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: { xs: 6, sm: 8 },
            }}
          >
            <CircularProgress />
          </Box>
        ) : vehicles.length === 0 ? (
          <Grid container>
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: 'center',
                  color: 'text.secondary',
                  py: { xs: 3, sm: 4 },
                  mt: { xs: 6, sm: 8 },
                }}
              >
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  No vehicles found. Please add a vehicle.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {vehicles.map((vehicle) => (
              <Grid item xs={12} sm={6} md={4} key={vehicle._id}>
                <VehicleCard
                  vehicle={vehicle}
                  services={servicesByVehicle[vehicle._id] || []}
                  onEdit={() => navigate(`/vehicles/${vehicle._id}/edit`)}
                  onDelete={() => setDeleteDialog({ open: true, vehicleId: vehicle._id })}
                  onMenuOpen={handleMenuOpen}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Service Action Menu */}
      <ServiceMenu
        anchorEl={menuAnchor.element}
        open={menuAnchor.open}
        onClose={handleMenuClose}
        onAddService={() => handleServiceAction('add')}
        onHistory={() => handleServiceAction('history')}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, vehicleId: null })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            mx: { xs: 2, sm: 'auto' },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
          },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Delete Vehicle
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="delete-dialog-description"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, vehicleId: null })}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
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

export default VehicleList
